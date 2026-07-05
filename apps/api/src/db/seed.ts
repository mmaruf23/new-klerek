// run this file with tsx, to seed the database.

async function main() {
  console.log("Tidak ada user yang di-seed.");
  console.log("User dibuat otomatis saat login Google pertama kali.");
  console.log("Role admin/superadmin diatur via env ADMIN_EMAILS / SUPERADMIN_EMAILS.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
