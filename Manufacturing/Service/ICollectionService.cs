using Manufacturing.Models;
using System.Threading.Tasks;

namespace Manufacturing.Service
{
    public interface ICollectionService<T>
    {
        // Finds a cross-section items matching a search pattern and in a specific state (Archived, Active, All).
        Task<CollectionResults<T>> Find(string search, int start, int count, UniqueEntity.State state);

        // Returns a specific item
        Task<T> Get(string id);

        // Adds a new item
        Task<T> Add(T item);

        // Removes an item.  By design, it is said items that are removed can be restored.
        Task<bool> Remove(string id);

        // Restores an item previously removes.
        Task<Material> Restore(string id);

        // Updates an item 'id' with the changes in 'item'.
        Task<T> Update(string id, T item);
    }
}
