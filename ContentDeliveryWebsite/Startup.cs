using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ContentDeliveryWebsite.Startup))]
namespace ContentDeliveryWebsite
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
