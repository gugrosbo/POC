using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Microsoft.CDM.Moby.Tools.WttHelperService.Client.Website.Models.ViewModels
{
    internal abstract class AbstractViewModelObject<T>
    {
        public abstract string ToValueField();
        public abstract void FromValue(string value);
        public string KeyField { get; set; }
    }
}
