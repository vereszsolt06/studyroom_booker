using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using studyroom_booker.Data;
using studyroom_booker.Dtos;
using studyroom_booker.Exceptions;
using studyroom_booker.Models;

namespace studyroom_booker.Services;

public class AuthService(AppDbContext db, IPasswordHasher<User> passwordHasher) : IAuthService
{
    public async Task<UserDto> LoginAsync(LoginRequest request)
    {
        var neptun = request.NeptunCode.Trim().ToUpperInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.NeptunCode == neptun);

        if (user == null || passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Hibás Neptun-kód vagy jelszó.");
        }

        return UserDto.From(user);
    }

    public async Task<UserDto> RegisterAsync(RegisterRequest request)
    {
        var neptun = request.NeptunCode.Trim().ToUpperInvariant();
        var name = request.Name.Trim();

        if (!Regex.IsMatch(neptun, "^[A-Z0-9]{6}$")) 
        { 
            throw new BadRequestException("A Neptun-kód 6 karakter: betűk és számok (pl. ABC123).");
        }

        if (name.Length < 3 || name.Length > 60)
        {
            throw new BadRequestException("A név 3–60 karakter legyen.");
        }

        if (request.Password.Length < 6)
        {
            throw new BadRequestException("A jelszó legalább 6 karakter legyen.");
        }

        if (await db.Users.AnyAsync(u => u.NeptunCode == neptun))
        {
            throw new ConflictException("Ezzel a Neptun-kóddal már van fiók.");
        }

        var user = new User { NeptunCode = neptun, Name = name };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return UserDto.From(user);
    }

    public async Task<UserDto> GetByIdAsync(int id)
    {
        var user = await db.Users.FindAsync(id) ?? throw new UnauthorizedException("A felhasználó nem létezik.");
        return UserDto.From(user);
    }
}