using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC.ContainerActor.Interfaces
{
    public class Container
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string State { get; set; }
        public string Image { get; set; }
        public string ImageTag { get; set; }
        public string Repository { get; set; }
        public string HostId { get; set; }
        public string HostName { get; set; }
        public string ComposeGroup { get; set; }
    }
}
