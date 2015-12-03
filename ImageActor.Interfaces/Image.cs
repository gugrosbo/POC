using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImageActor.Interfaces
{
    public class Image
    {
        public string Id { get; set; }
        public string ImageTag { get; set; }
        public string Name { get; set; }
        public string Repository { get; set; }
        public string Size { get; set; }
        public string VirtualSize { get; set; }
        public string HostId { get; set; }
    }
}
