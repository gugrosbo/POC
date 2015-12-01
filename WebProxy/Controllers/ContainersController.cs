using System.Diagnostics;
using System.Collections.Generic;
using POC.ContainerActor.Interfaces;
using Microsoft.ServiceFabric.Actors;
using Microsoft.AspNet.Mvc;
using System.Threading.Tasks;

namespace Microsoft.OMS.MobyDockMgmt.MobyDockMgmtService
{

    //[EnableCors(origins: "*", headers: "*", methods: "*")]
    [Route("api/[controller]")]
    public class ContainersController : Controller
    {
        private IContainerActor actor;

        public ContainersController()
        {
            ActorId actorId = ActorId.NewId();
            string applicationName = "fabric:/ContainerControllerApp1";
            IContainerActor hostActor = ActorProxy.Create<IContainerActor>(actorId, applicationName);

            this.actor = hostActor;
        }

        public async Task<List<Container>> GetAllContainers()
        {
            return await this.actor.GetAllContainers();
        }

        public async Task<List<Container>> GetContainersByHost(string hostName)
        {
            Debug.Assert(!string.IsNullOrEmpty(hostName), "hostName is null or empty");

            return await  this.actor.GetContainersByHost(hostName);
        }

        public async Task<Container> GetContainerByName(string name)
        {
            return await this.actor.GetContainerByName(name);
        }

        public async Task<Container> GetContainerById(string id)
        {
            return await this.actor.GetContainerById(id);
        }

        [HttpGet]
        public async Task<LinkGraph> GetContainerLinkGraphJson(string id)
        {
            return await actor.RepresentLinksAsJson(id);
        }

        [HttpPost]
        public async Task<string> StartContainer(string id)
        {
            Debug.Assert(!string.IsNullOrEmpty(id));
            Debug.WriteLine("starting container id " + id);

            return await actor.StartContainer(id);
        }

        [HttpPost]
        public async Task<string> StopContainer(string id)
        {
            Debug.Assert(!string.IsNullOrEmpty(id));
            Debug.WriteLine("stopping container id " + id);

            return await (actor.StopContainer(id);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteContainer(string id)
        {
            Debug.Assert(!string.IsNullOrEmpty(id));
            Debug.WriteLine("deleting container id " + id);

            await this.actor.DeleteContainerById(id);
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> ConnectContainer(string id)
        {
            Debug.Assert(!string.IsNullOrEmpty(id));

            Debug.WriteLine("connecting container id " + id);
            return Ok();
        }
    }
}
