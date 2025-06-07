import { createClient } from "../../supabase/server";
import Navbar from "./navbar";

export default async function NavbarServer() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return <Navbar initialUser={user} />;
}
