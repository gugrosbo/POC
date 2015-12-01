using Microsoft.ServiceFabric.Actors;
using POC.HostActor.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace POC.HostActor
{
    /// <remarks>
    /// Each ActorID maps to an instance of this class.
    /// The IProjName  interface (in a separate DLL that client code can
    /// reference) defines the operations exposed by ProjName objects.
    /// </remarks>
    internal class HostActor : StatefulActor<HostActor.ActorState>, IHostActor
    {
        /// <summary>
        /// This class contains each actor's replicated state.
        /// Each instance of this class is serialized and replicated every time an actor's state is saved.
        /// For more information, see http://aka.ms/servicefabricactorsstateserialization
        /// </summary>
        [DataContract]
        internal sealed class ActorState
        {
            [DataMember]
            public List<Host> Hosts { get; set; }

            public override string ToString()
            {
                return string.Join(";", this.Hosts.Select(x => x.Name));
            }
        }

        /// <summary>
        /// This method is called whenever an actor is activated.
        /// </summary>
        protected override Task OnActivateAsync()
        {
            if (this.State == null)
            {
                // This is the first time this actor has ever been activated.
                // Set the actor's initial state values.
                this.State = new ActorState { Hosts = new List<Host>() };
            }

            ActorEventSource.Current.ActorMessage(this, "State initialized to {0}", this.State);
            return Task.FromResult(true);
        }


        [Readonly]
        public Task<List<Host>> GetAllHosts()
        {
            ActorEventSource.Current.ActorMessage(this, "Getting all hosts");

            var hosts = this.State.Hosts;
            return Task.FromResult(hosts);
        }

        [Readonly]
        public Task<Host> GetHostByName(string name)
        {
            ActorEventSource.Current.ActorMessage(this, "Get host by name {0}", name);

            var host = this.State.Hosts.FirstOrDefault(x => x.Name.Equals(name));
            return Task.FromResult(host);
        }

        [Readonly]
        public Task<Host> GetHostById(string id)
        {

            ActorEventSource.Current.ActorMessage(this, "Get host by id {0}", id);

            var host = this.State.Hosts.FirstOrDefault(x => x.Id.Equals(id));
            return Task.FromResult(host);
        }
        

        public Task<bool> PutHost(Host host)
        {
            ActorEventSource.Current.ActorMessage(this, "Adding host {0}", host);
            this.State.Hosts.Add(host);
            return Task.FromResult(true);
        }

        public Task<int> GetCountAsync()
        {
            throw new NotImplementedException();
        }

        public Task SetCountAsync(int count)
        {
            throw new NotImplementedException();
        }
    }
}
