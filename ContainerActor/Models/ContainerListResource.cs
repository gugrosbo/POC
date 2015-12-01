using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC.ContainerActor.Models
{
    public class ContainerListResource
    {
        public string Id { get; set; }
        public string Image { get; set; }
        public List<string> Names { get; set; }
        public string Status { get; set; }
    }
}
