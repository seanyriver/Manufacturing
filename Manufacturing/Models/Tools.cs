using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Manufacturing.Models
{
    public static class Tools
    {
        public static T DeepClone<T>(T obj)
        {
            var serializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            string tmp = JsonConvert.SerializeObject(obj, serializerSettings);
            return (T)JsonConvert.DeserializeObject<T>(tmp);
        }

        public static void AssignId<T> (T obj, Action<T> action = null) where T : UniqueEntity
        {
            obj.Id = NewId;
            action?.Invoke(obj);
        }

        public static void AssignId<T> (ICollection<T> items, Action<T> action = null) where T : UniqueEntity
        {
            if (items != null)
                foreach (T item in items)
                    AssignId(item, action);
        }

        public static void ReAssignId<T> (T obj, Dictionary<string,string> oldToNew, Action<T> action = null) where T : UniqueEntity
        {
            if (obj == null)
                return;

            // If it has an ID, then we need to reassign it.  If oldToNew is provided, we
            // see if someone else has already mapped that ID and use the mapping; otherwise we
            // generate a new ID and store the mapping for future use.
            if (obj.Id != null)
            {
                if (oldToNew == null || !oldToNew.ContainsKey(obj.Id))
                {
                    string tmp = obj.Id;
                    obj.Id = NewId;
                    if (oldToNew != null)
                        oldToNew[tmp] = obj.Id;
                }
                else
                    obj.Id = oldToNew[obj.Id];
            }
            else
                obj.Id = NewId;

            action?.Invoke(obj);
        }

        public static void ReAssignId<T> (ICollection<T> items, Dictionary<string,string> oldToNew, Action<T> action = null) where T : UniqueEntity
        {
            if (items != null)
                foreach (T item in items)
                    ReAssignId(item, oldToNew, action);
        }

        public static string NewId
        {
            get
            {
                return Guid.NewGuid().ToString();
            }
        }

        public class PositionalComparer : Comparer<IPositional>
        {
            public override int Compare(IPositional x, IPositional y)
            {
                int xPos = x.Position;
                int yPos = y.Position;
                return xPos.CompareTo(yPos);
            }
        }

        public class TitleComparer : Comparer<ITitled>
        {
            public override int Compare(ITitled x, ITitled y)
            {
                string xTitle = x.Title ?? "";
                string yTitle = y.Title ?? "";
                return xTitle.CompareTo(yTitle);
            }
        }

        public static DbContext GetDbContext<T>(this DbSet<T> dbSet) where T : class
        {
            var infrastructure = dbSet as IInfrastructure<IServiceProvider>;
            var serviceProvider = infrastructure.Instance;
            var currentDbContext = serviceProvider.GetService(typeof(ICurrentDbContext))
                                       as ICurrentDbContext;
            return currentDbContext.Context;
        }

        /**
         * Updates an entity in a dbset, based on the action to be performed.
         * Optionally saves changes.  When dealing with multiple records, one may
         * choose to save changes after a series of calls.
         */
        public static async Task<bool> UpdateEntity<T>(this DbSet<T> db, Func<T, bool> selector, Action<EntityEntry<T>> action, bool saveChanges = true) where T: class
        {
            var s = await db.Where(f => selector(f)).FirstOrDefaultAsync();
            if (s == null)
                return false;

            var dbs = db.Attach(s);
            action.Invoke(dbs);

            if (saveChanges)
                await GetDbContext(db).SaveChangesAsync();

            return true;
        }

        /**
         * Sets the Deleted property to UtcNow, and the Archived property to true, for a UniqueEntity.
         */
        public static async Task<bool> RemoveEntity<T>(this DbSet<T> db, Func<T, bool> selector, bool saveChanges = true) where T : UniqueEntity
        {
            return await UpdateEntity(db, selector, dbs =>
            {
                dbs.Property(f => f.Archived).CurrentValue = true;
                dbs.Property(f => f.Deleted).CurrentValue = DateTimeOffset.UtcNow;
            }, saveChanges);
        }

        public static string DecimalToArbitrarySystem(long decimalNumber, int radix)
        {
            const int BitsInLong = 64;
            const string Digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            if (radix < 2 || radix > Digits.Length)
                throw new ArgumentException("The radix must be >= 2 and <= " + Digits.Length.ToString());

            if (decimalNumber == 0)
                return "0";

            int index = BitsInLong - 1;
            long currentNumber = Math.Abs(decimalNumber);
            char[] charArray = new char[BitsInLong];

            while (currentNumber != 0)
            {
                int remainder = (int)(currentNumber % radix);
                charArray[index--] = Digits[remainder];
                currentNumber = currentNumber / radix;
            }

            string result = new String(charArray, index + 1, BitsInLong - index - 1);
            if (decimalNumber < 0)
            {
                result = "-" + result;
            }

            return result;
        }

        public static void RemoveClientIds (UniqueEntity ue)
        {
            if (ue == null)
                return;

            if (ue.Id != null && ue.Id.StartsWith("client"))
                ue.Id = null;

            // Add variations to deal with child items.
            //if (ue is ANOTHERTYPE q)
                //RemoveClientIds(q.Items);
        }

        public static void RemoveClientIds<T> (ICollection<T> ues) where T : UniqueEntity
        {
            if (ues != null)
                foreach (var ue in ues)
                    RemoveClientIds(ue);
        }



        public static async Task<bool> IsInRole(this ApplicationDbContext Db, string userId, string role)
        {
            return await Db.UserRoles
                .Where(f => f.UserId == userId)
                .Join(Db.Roles, f => f.RoleId, f => f.Id, (f, g) => g.Name)
                .ContainsAsync(Models.People.Roles.Admin);
        }

        public static CollectionResults<T> FindEntities<T>(this DbSet<T> Collection, string search, int start, int count, UniqueEntity.State state) where T : NamedEntity
        {
            var items = Collection.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                items = items.Where(f => f.Name.Contains(search));

            if (state == UniqueEntity.State.Active)
                items = items.Where(f => f.Archived == false);
            else if (state == UniqueEntity.State.Archived)
                items = items.Where(f => f.Archived == true);

            return CollectionResults<T>.FromQueryable(items.OrderBy(f => f.Name), start, count);
        }

        public static string ToFriendlyBase64 (string s) => s.Replace('+', '-').Replace('/', '_');
        public static string ToUnFriendlyBase64 (string s) => s.Replace('-', '+').Replace('_', '/');
    }
}
