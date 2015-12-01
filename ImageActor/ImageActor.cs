using ImageActor.Interfaces;
using Microsoft.ServiceFabric.Actors;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ImageActor
{
    /// <remarks>
    /// Each ActorID maps to an instance of this class.
    /// The IImageActor interface (in a separate DLL that client code can
    /// reference) defines the operations exposed by ImageActor objects.
    /// </remarks>
    internal class ImageActor : StatelessActor, IImageActor
    {
        Task<string> IImageActor.DoWorkAsync()
        {
            // TODO: Replace the following with your own logic.
            ActorEventSource.Current.ActorMessage(this, "Doing Work");

            return Task.FromResult("Work result");
        }
    }
}
