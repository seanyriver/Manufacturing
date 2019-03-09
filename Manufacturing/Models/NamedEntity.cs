using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Manufacturing.Models
{
    public class NamedEntity : UniqueEntity
    {
        public string Name { get; set; }
    };
}
