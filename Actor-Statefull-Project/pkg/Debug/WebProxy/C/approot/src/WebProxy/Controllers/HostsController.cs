using System.Diagnostics;
using System.Collections.Generic;
using POC.HostActor.Interfaces;
using Microsoft.ServiceFabric.Actors;
using Microsoft.AspNet.Mvc;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Web.ModelBinding;
using Microsoft.AspNet.Cors;

namespace Microsoft.OMS.MobyDockMgmt.MobyDockMgmtService
{

    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class HostsController : Controller
    {
        private IHostActor actor;

        public HostsController()
        {
            ActorId actorId = ActorId.NewId();
            string applicationName = "fabric:/Actor_Statefull_Project";
            IHostActor hostActor = ActorProxy.Create<IHostActor>(actorId, applicationName);

            this.actor = hostActor;
        }

        // GET getall
        [HttpGet]
        public async Task<List<Host>> GetAllHosts()
        {
            return await this.actor.GetAllHosts();
        }

        [HttpGet("{name}")]
        public async Task<Host> GetHostByName(string name)
        {
            return await actor.GetHostByName(name);
        }

        [HttpGet("{id}")]
        public async Task<Host> GetHostById(string id)
        {
            return await actor.GetHostById(id);
        }

         // PUT add
         [HttpPut]
        public async Task<IActionResult> PutHost([FromBody]Host host) {
            //DefaultModelBinder x;
            //var result = JsonConvert.DeserializeObject<Host>(this.Request.ToString());
            // Debug.Assert(host != null, "host object is null or empty");
            var h = new Host() { Name = "test", Port = 2375 };
            await actor.PutHost(host);
            return Ok();
        }

        //[HttpPost]
        //public IHttpActionResult StartHost([FromBody]string name)
        //{
        //    return Ok();
        //}
    }
}
