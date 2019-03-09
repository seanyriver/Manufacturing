using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Manufacturing.Models
{
    public class Material : NamedEntity
    {
        public string Units { get; set; }

        /*
        public List<string> Tags
        {
            get; set;
        }

        [JsonIgnore]
        public List<Tag> TagObjects
        {
            get => Tags?.Select(t => new Tag { Name = t }).ToList();
            set => Tags = value?.Select(t => t.Name).ToList();
        }
        */
    }
}
