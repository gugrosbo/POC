namespace Microsoft.CDM.Moby.Tools.WttHelperService.Client.Website.Models
{
    using System.DirectoryServices.AccountManagement;

    public class WebUser
    {
        public string Name { get; set; }

        public string Alias { get; set; }

        public string Domain { get; set; }

        public bool IsAdmin { get; set; }


        public override string ToString()
        {
            return string.Format("{0}\\{1}", Domain, Alias);
        }

        public WebUser(UserPrincipal up)
        {
            this.Init(up);
        }

        public void Init(UserPrincipal up)
        {
            this.Name = up.Name;
            this.Alias = up.SamAccountName;

            // todo ; get the domain using a clean way
            this.Domain = up.DistinguishedName.Split(',')[2].Substring(3);

            // DistinguishedName = "CN=Guillaume Grosbois,OU=UserAccounts,DC=redmond,DC=corp,DC=microsoft,DC=com"
        }
    }



}