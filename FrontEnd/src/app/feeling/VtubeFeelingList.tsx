import Link from "next/link";
import Image from "next/image";

interface Vtuber {
  id: string;
  name: string;
  age: string;
  icon_image: string;
  description: string;
  height: string;
  birthdate: string;
  youtube: string;
  twitter: string;
  discord: string;
  facebook: string;
  port_image: string;
}

interface VtubeListProps {
  vtubers: Vtuber[];
  currentUser: {
    role: "ADMIN" | "USER" | "GUEST";
  } | null;
}

export default function VtubeFeelingList({
  vtubers,
  currentUser,
}: VtubeListProps) {
  if (!vtubers || vtubers.length === 0) {
    return <p>No vtubers available.</p>;
  }

  // Sort by alphabet
  function sortbyAlphabet(a: Vtuber, b: Vtuber) {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  return (
    <>
      {vtubers.sort(sortbyAlphabet).map((vtube) => (
        <div
          key={vtube.id}
          className="mt-6 mr-6 bg-inherit overflow-hidden shadow-md relative transition ease-in-out delay-80 hover:-translate-y-1 
          hover:scale-105 duration-300 hover:bg-palette2 text-white rounded-3xl"
        >
          <div className="flex justify-start text-left static">
            <Link href={`/feeling/${vtube.name}`} passHref>
              <div className="flex">
                {vtube.icon_image !== "UNDEFINED" && (
                  <Image
                    className="rounded-3xl"
                    alt={vtube.name}
                    src={vtube.icon_image}
                    width={150}
                    height={100}
                    quality={100}
                  />
                )}

                <div className="ml-4 flex">
                  <p className="font-bold text-3xl flex items-center">
                    Feeling for: {vtube.name}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}
