using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace Manufacturing.Models.People
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }
    }
}
