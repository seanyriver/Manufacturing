using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace Manufacturing.Migrations
{
    public partial class MaterialIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Material",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Material_Archived_Id",
                table: "Material",
                columns: new[] { "Archived", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Material_Archived_Name",
                table: "Material",
                columns: new[] { "Archived", "Name" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Material_Archived_Id",
                table: "Material");

            migrationBuilder.DropIndex(
                name: "IX_Material_Archived_Name",
                table: "Material");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Material",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}
