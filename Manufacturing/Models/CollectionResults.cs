using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Manufacturing.Models
{
    public class CollectionResults<T>
    {
        public ICollection<T> Items { get; set; }
        public int TotalCount { get; set; }

        public static CollectionResults<T> FromEnumerable (IEnumerable<T> items, int start, int count, int totalCount = -1)
        {
            int TotalCount = (totalCount != -1 ? totalCount : items.Count());

            if (start > 0)
                items = items.Skip(start);
            if (count >= 0)
                items = items.Take(count);

            return new CollectionResults<T>
            {
                Items = items.ToList(),
                TotalCount = TotalCount
            };
        }

        public static CollectionResults<T> FromQueryable(IQueryable<T> items, int start, int count, int totalCount = -1)
        {
            int TotalCount = (totalCount != -1 ? totalCount : items.Count());

            if (start > 0)
                items = items.Skip(start);
            if (count >= 0)
                items = items.Take(count);

            return new CollectionResults<T>
            {
                Items = items.ToList(),
                TotalCount = TotalCount
            };
        }

        public static CollectionResults<T> FromEnumerable<U>(IEnumerable<U> items, Func<U,T> convert, int start, int count, int totalCount = -1)
        {
            int TotalCount = (totalCount != -1 ? totalCount : items.Count());

            if (start > 0)
                items = items.Skip(start);
            if (count >= 0)
                items = items.Take(count);

            return new CollectionResults<T>
            {
                // To List before Select.  If you don't do this, Include()'s are lost.
                Items = items.ToList ().Select(item => convert(item)).ToList(),
                TotalCount = TotalCount
            };
        }

        public static CollectionResults<T> FromQueryable<U>(IQueryable<U> items, Func<U, T> convert, int start, int count, int totalCount = -1)
        {
            int TotalCount = (totalCount != -1 ? totalCount : items.Count());

            if (start > 0)
                items = items.Skip(start);
            if (count >= 0)
                items = items.Take(count);

            return new CollectionResults<T>
            {
                // To List before Select.  If you don't do this, Include()'s are lost.
                Items = items.ToList ().Select(item => convert(item)).ToList(),
                TotalCount = TotalCount
            };
        }
    }
}
