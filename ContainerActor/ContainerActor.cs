using POC.HostActor.Interfaces;
using Microsoft.ServiceFabric.Actors;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Diagnostics;
using RestSharp;
using POC.ContainerActor.Interfaces;
using POC.ContainerActor.Models;

namespace POC.ContainerActor
{
    /// <remarks>
    /// Each ActorID maps to an instance of this class.
    /// The IContainerActor interface (in a separate DLL that client code can
    /// reference) defines the operations exposed by ContainerActor objects.
    /// </remarks>
    internal class ContainerActor : StatelessActor, IContainerActor
    {

        private IHostActor _hostActor;
        private IHostActor HostActor
        {
            get
            {
                if (this._hostActor == null)
                {
                    ActorId actorId = ActorId.NewId();
                    string applicationName = "fabric:/HostControllerApp1";
                    _hostActor = ActorProxy.Create<IHostActor>(actorId, applicationName);
                }

                return this._hostActor;
            }
        }

        public async Task DeleteContainerById(string hostId, string id)
        {
            Debug.Assert(id != null);
            var container = await GetContainerById(hostId, id);
            var host = await HostActor.GetHostById(container.HostId);

            // Remove container from Docker
            var restClient = new RestClient(host.HostUrl);
            var request = new RestRequest(string.Format("/containers/{0}", id));

            var response = restClient.ExecuteAsPost(request, "DELETE");
            // TODO - check response for success
        }

        public async Task<List<Container>> GetAllContainers()
        {
            Debug.WriteLine("getting all containers : ");

            // Get the data for this host. 

            var hosts = await HostActor.GetAllHosts();
            Debug.Assert(hosts != null, "There is no hosts yet.");

            var retVal = new List<Container>();

            foreach (var host in hosts)
            {
                RestClient client = new RestClient(host.HostUrl);
                RestRequest request = new RestRequest("/containers/json?all=1");

                IRestResponse<List<ContainerListResource>> response = client.Execute<List<ContainerListResource>>(request);
                Debug.WriteLineIf(response.Data == null, "No response from host, return an empty list of containers");
                if (response.Data != null)
                {
                    var containers = response.Data.Select(c => this.Convert(c, host)).ToList();
                    retVal.AddRange(containers);
                }
            }

            return retVal;
        }

        public async Task<Container> GetContainerById(string hostId, string id)
        {
            Debug.Assert(!string.IsNullOrEmpty(hostId), "The host id specified is null or empty : cannot get details about the container.");

            var host = await HostActor.GetHostById(hostId);

            Debug.Assert(!string.IsNullOrEmpty(id), "The id specified is null or empty : cannot get details about the container.");

            RestClient client = new RestClient(host.HostUrl);
            RestRequest request = new RestRequest("/containers/" + id + "/json");

            var response = client.Execute<ContainerListResource>(request);

            return this.Convert(response.Data, host);
        }

        public async Task<Container> GetContainerByName(string hostId, string name)
        {
            Debug.Assert(!string.IsNullOrEmpty(hostId), "The host id specified is null or empty : cannot get details about the container.");

            var host = await HostActor.GetHostById(hostId);

            Debug.Assert(!string.IsNullOrEmpty(name), "The name specified is null or empty : cannot get details about the container.");

            RestClient client = new RestClient(host.HostUrl);
            RestRequest request = new RestRequest("/containers/" + name + "/json");

            var response = client.Execute<ContainerListResource>(request);

            return this.Convert(response.Data, host);
        }

        public async Task<List<Container>> GetContainersByHost(string hostName)
        {
            Debug.Assert(!string.IsNullOrEmpty(hostName), "hostName is null or empty");
            Debug.WriteLine("getting containers by host: " + hostName);

            // Get the data for this host. 

            var host = await HostActor.GetHostByName(hostName);
            Debug.Assert(host != null, "HostName was invalid, this host hasn't been added yet.");

            RestClient client = new RestClient(host.HostUrl);
            RestRequest request = new RestRequest("/containers/json?all=1");

            IRestResponse<List<ContainerListResource>> response = client.Execute<List<ContainerListResource>>(request);
            Debug.WriteLineIf(response.Data == null, "No response from host, return an empty list of containers");
            if (response.Data == null)
                return new List<Container>();

            var containerViews = response.Data.Select(c => this.Convert(c, host)).ToList();

            return containerViews;
        }

        public Task<LinkGraph> RepresentLinksAsJson(string id)
        {
            throw new NotImplementedException();
        }

        public Task<string> StartContainer(string id)
        {
            throw new NotImplementedException();
        }

        public Task<string> StopContainer(string id)
        {
            throw new NotImplementedException();
        }


        #region Private methods

        /// <summary>
        /// Get the compose group of a container
        /// </summary>
        /// <returns>Compose group name, empty if not composed</returns>
        private static string GetContainerComposeGroup(Uri hostAddress, string id)
        {
            var response = InspectContainerId(hostAddress, id);
            string result = "";

            if (response != null && response.Data != null && response.Data.Config != null)
            {
                if (response.Data.Config.Labels != null)
                {
                    result = response.Data.Config.Labels.ContainsKey("com.docker.compose.project") ? response.Data.Config.Labels["com.docker.compose.project"] : string.Empty;
                }
            }
            else
            {
                Trace.WriteLine("GetContainerComposeGroup deserialization failed for container " + id + " on host " + hostAddress);
            }

            return result;
        }

        private Container Convert(ContainerListResource containerResource, Host host)
        {
            var container = new Container();
            container.HostName = host.Name;
            container.HostId = host.Id;
            container.Id = containerResource.Id;

            // Remove the initial '/' returned in the name by Docker. Then find the first name with no '/' as this indicates a link name.
            container.Name = containerResource.Names.Select(name => name.Substring(1)).FirstOrDefault(name => !name.Contains('/'));
            container.State = containerResource.Status.StartsWith("Up") ? "Running" : "Stopped";

            string image, repository, imageTag;
            ExtractImageInfo(containerResource.Image, out image, out repository, out imageTag);

            container.Image = image;
            container.Repository = repository;
            container.ImageTag = imageTag;
            container.ComposeGroup = GetContainerComposeGroup(host.HostUrl, containerResource.Id);

            return container;
        }

        /// <summary>
        /// Used to run docker inspect
        /// </summary>
        private static IRestResponse<ContainerInspect> InspectContainerId(Uri hostAddress, string id)
        {
            // Verify arguments
            if (hostAddress == null || string.IsNullOrWhiteSpace(id))
            {
                Trace.WriteLine("Host address or container ID is null");
                return null;
            }

            // Connect to host
            var client = new RestClient(hostAddress);
            var request = new RestRequest("containers/" + id + "/json");
            return client.Execute<ContainerInspect>(request);
        }

        #endregion

        private static void ExtractImageInfo(string image, out string imageName, out string repository, out string imageTag)
        {
            repository = string.Empty;
            imageTag = string.Empty;
            imageName = image;

            // First split off repository
            int index = image.IndexOf('/');
            if (index != -1 && index < image.Length - 1)
            {
                repository = image.Substring(0, index);
                imageName = image.Substring(index + 1);
                image = imageName;
            }

            // Split out image tag
            index = image.IndexOf(':');
            if (index != -1 && index < image.Length - 1)
            {
                imageName = image.Substring(0, index);
                imageTag = image.Substring(index + 1);
            }
        }
    }
}
