using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace POC.HostActor.Interfaces
{
    [DataContract]
    public class Host
    {
        public Host(string name, int port, string version)
        {
            this.Name = name;
            this.Port = port;
            this.Version = version;

            this.URL = new Uri(string.Format("http://{0}:{1}", Name, Port));
        }

        [DataMember]
        public string Id { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public Uri URL { get; set; }

        [DataMember]
        public int Port { get; set; }

        [DataMember]
        public string Version { get; set; }
    }
}
