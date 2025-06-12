export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HospConnect. All rights reserved.</p>
        <p className="text-sm mt-2">Your health, our priority. Connecting you to care, seamlessly.</p>
      </div>
    </footer>
  );
}
