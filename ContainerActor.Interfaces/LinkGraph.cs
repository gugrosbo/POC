using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC.ContainerActor.Interfaces
{
    public class LinkGraph
    {
        public List<Container> nodes { get; set; }

        public List<Tuple<string, string>> edges { get; set; }
    }
}
