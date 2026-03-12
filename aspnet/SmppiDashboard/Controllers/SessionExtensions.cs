using Newtonsoft.Json;

namespace SmppiDashboard.Controllers;

/// <summary>Helper methods to store/retrieve complex objects in ISession as JSON.</summary>
public static class SessionExtensions
{
    public static void SetObjectAsJson(this ISession session, string key, object value)
        => session.SetString(key, JsonConvert.SerializeObject(value));

    public static T? GetObjectFromJson<T>(this ISession session, string key)
    {
        var value = session.GetString(key);
        return value == null ? default : JsonConvert.DeserializeObject<T>(value);
    }
}
