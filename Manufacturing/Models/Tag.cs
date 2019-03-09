using System.ComponentModel.DataAnnotations;

namespace Manufacturing.Models
{
    public class Tag
    {
        private string _name;

        [Key]
        public string Name
        {
            get => _name;
            set => _name = value.ToLowerInvariant();
        }
    }
}
