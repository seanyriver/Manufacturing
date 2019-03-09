using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Manufacturing.Models
{
    public class UniqueEntity
    {
        [Key]
        [JsonProperty(Order=-10)]
        public string Id { get; set; }
        
        [JsonProperty(Order=-9,DefaultValueHandling =DefaultValueHandling.Ignore)]
        public bool Archived { get; set; }

        // We use this state for query purposes.  Whether an item is in
        // one state or the other is based on the Archived boolean value.
        public enum State
        {
            None = 0,
            Active = 1,
            Archived = 2,
            All = Active|Archived
        };

        [JsonProperty(Order=-8,DefaultValueHandling =DefaultValueHandling.Ignore)]
        public DateTimeOffset? Created { get; set; }
        [JsonProperty(Order=-7,DefaultValueHandling =DefaultValueHandling.Ignore)]
        public DateTimeOffset? Modified { get; set; }
        [JsonProperty(Order=-6,DefaultValueHandling =DefaultValueHandling.Ignore)]
        public DateTimeOffset? Deleted { get; set; }
    };
}
