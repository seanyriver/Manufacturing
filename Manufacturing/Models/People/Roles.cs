using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Manufacturing.Models.People
{
    public class Roles
    {
        public static string Admin { get => "admin"; }
        public static string Standard { get => "standard"; }
        public static string API { get => "api"; }

        public static List<string> AsList() => typeof(Roles)
                .GetProperties(BindingFlags.Public | BindingFlags.Static)
                .Where(p => p.PropertyType == typeof(string))
                .Select(p => (string)p.GetValue(null))
                .ToList();

        public static IEnumerable<T> Select<T>(Func<string,T> func) => AsList().Select(func);

        private static Task Invoke(string s, Action<string> func) { func(s); return Task.CompletedTask; }

        public static async void ForEach(Action<string> func)
        {
            await Task.WhenAll( AsList().Select((s) => Invoke(s, func) ));
        }
    }
}
