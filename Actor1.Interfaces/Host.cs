using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace POC.HostActor.Interfaces
{
    //[DataContract]
    public class Host
    {
        #region data members
       // [DataMember]
        public string Id { get; set; }

        //[DataMember]
        public string Name { get; set; }
               
        //[DataMember]
        public int Port { get; set; }

        //[DataMember]
        public string Version { get; set; }
        #endregion

        public Uri HostUrl { get { return new Uri(string.Format("http://{0}:{1}", Name, Port)); } }
    }
}
