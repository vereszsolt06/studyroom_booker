namespace studyroom_booker.Models;

public class User
{
    public int Id { get; set; }
    public string NeptunCode { get; set; } = "";
    public string Name { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public bool IsAdmin { get; set; }
}