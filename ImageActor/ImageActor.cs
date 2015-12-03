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
        public Task<List<Image>> GetAllImages()
        {
            throw new NotImplementedException();
        }

        public Task<Image> GetImageById(string id)
        {
            throw new NotImplementedException();
        }

        public Task<List<Image>> GetImagesByHost(string hostName)
        {
            throw new NotImplementedException();
        }

        Task<string> DoWorkAsync()
        {
            // TODO: Replace the following with your own logic.
            ActorEventSource.Current.ActorMessage(this, "Doing Work");

            return Task.FromResult("Work result");
        }
    }
}
