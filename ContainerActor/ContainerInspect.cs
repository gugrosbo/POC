using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC.ContainerActor
{
    public class ContainerInspect
    {
        public class HostConfigData
        {
            public List<string> Links
            {
                get;
                set;
            }
        }

        public class ConfigData
        {
            public Dictionary<string, string> Labels
            {
                get;
                set;
            }
        }

        public string Id
        {
            get;
            set;
        }

        public string Image
        {
            get;
            set;
        }

        public string Name
        {
            get;
            set;
        }

        public HostConfigData HostConfig
        {
            get;
            set;
        }

        public ConfigData Config
        {
            get;
            set;
        }
    }
}
