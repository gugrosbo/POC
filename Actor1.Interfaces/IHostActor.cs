using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Actors;

namespace POC.HostActor.Interfaces
{
    /// <summary>
    /// This interface represents the actions a client app can perform on an actor.
    /// It MUST derive from IActor and all methods MUST return a Task.
    /// </summary>
    public interface IHostActor : IActor
    {
        Task<int> GetCountAsync();

        Task SetCountAsync(int count);

        // GET getall
        Task<List<Host>> GetAllHosts();

        Task<Host> GetHostByName(string name);

        Task<Host> GetHostById(string id);

        // PUT add
        Task<bool> PutHost(Host host);
    }
}
