namespace Microsoft.CDM.Moby.Tools.WttHelperService.Client.Website.Models.ViewModels
{
    using System.Dynamic;

    public class AjaxTransferModel
    {
        public object Object { get; set; }

        public AjaxTransferModel(object o)
        {
            this.Object = o;
        }
    }
}