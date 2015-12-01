using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Actors;

namespace POC.ContainerActor.Interfaces
{
    public interface IContainerActor : IActor
    {
        Task<List<Container>> GetAllContainers();

        Task<List<Container>> GetContainersByHost(string hostName);

        Task<Container>GetContainerByName(string hostId, string name);

        Task<Container> GetContainerById(string hostId, string id);


        #region Delete container methods

        Task DeleteContainerById(string hostId, string id);

        #endregion

        #region Container relationship methods

        /// <summary>
        /// Generate JSON representation of container link dependencies
        /// </summary>
        Task<LinkGraph> RepresentLinksAsJson(string id);

        #endregion

        #region Change container state methods

        Task<string> StartContainer(string id);

        Task<string> StopContainer(string id);

        #endregion

     
    }
}
