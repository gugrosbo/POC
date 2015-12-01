using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Actors;

namespace ImageActor.Interfaces
{
    public interface IImageActor : IActor
    {
        Task<List<Image>> GetAllImages();

        Task<List<Image>> GetImagesByHost(string hostName);

        Task<Image> GetImageById(string id);
    }
}
