using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Manufacturing.Models;
using Manufacturing.Service;

namespace Manufacturing.Controllers
{
    [Route("api/[controller]s")]
    public class MaterialController : Controller
    {
        private IMaterialService _materials;

        public MaterialController (IMaterialService materials)
        {
            _materials = materials;
        }

        [HttpGet]
        public async Task<CollectionResults<Material>> Materials(string search, int start, int count, bool includeArchived = false)
        {
            return await _materials.Find(search, start, count, includeArchived ? UniqueEntity.State.All : UniqueEntity.State.Active);
        }

        [HttpGet("{id}")]
        public async Task<Material> Material(string id)
        {
            return await _materials.Get(id);
        }


        [HttpDelete("{id}")]
        public async Task<bool> RemoveMaterial(string id)
        {
            return await _materials.Remove(id);
        }

        [HttpDelete("{id}/archived")]
        public async Task<Material> RestoreMaterial(string id)
        {
            return await _materials.Restore(id);
        }

        [HttpPost]
        public async Task<Material> AddMaterial([FromBody] Material material)
        {
            return await _materials.Add(material);
        }

        [HttpPatch("{id}")]
        public async Task<Material> PatchMaterial(string id, [FromBody] Material material)
        {
            return await _materials.Update(id, material);
        }
    }
}
