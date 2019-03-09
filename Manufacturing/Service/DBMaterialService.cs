using Manufacturing.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Manufacturing.Service
{
    public class DBMaterialService : IMaterialService
    {
        private ApplicationDbContext Db;

        public DBMaterialService(ApplicationDbContext db)
        {
            Db = db;
        }

        public async Task<Material> Add(Material item)
        {
            item.Id = Tools.NewId;
            item.Created = DateTimeOffset.UtcNow;
            item.Modified = DateTimeOffset.UtcNow;
            item.Archived = false;
            item.Deleted = null;

            await Db.Material.AddAsync(item);
            await Db.SaveChangesAsync();

            return item;
        }

        public async Task<CollectionResults<Material>> Find(string search, int start, int count, UniqueEntity.State state)
        {
            return Db.Material.FindEntities(search, start, count, state);
        }

        public async Task<Material> Get(string id)
        {
            return Db.Material.Find(id);
        }

        public async Task<bool> Remove(string id)
        {
            return await Db.Material.RemoveEntity(f => f.Id == id);
        }

        public async Task<Material> Update(string id, Material item)
        {
            await Db.Material.UpdateEntity(f => f.Id == id, entry =>
            {
                if (item.Name != null)
                    entry.Property(e => e.Name).CurrentValue = item.Name;
                if (item.Units != null)
                    entry.Property(e => e.Units).CurrentValue = item.Units;
            });
            return await Get(id);
        }

        public async Task<Material> Restore(string id)
        {
            await Db.Material.UpdateEntity(f => f.Id == id, entry =>
            {
                entry.Property(e => e.Archived).CurrentValue = false;
                entry.Property(e => e.Deleted).CurrentValue = null;
            });

            // When restoring an item, we return the item that has been restored.
            return await Get(id);
        }
    }
}
