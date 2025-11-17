import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export function TravelBanner() {
  return (
    <div className="relative w-full bg-gradient-to-b from-blue-500 to-cyan-300 overflow-hidden mt-2">
      <div className="container mx-auto px-12 h-[280px] flex items-center justify-center relative">
        {/* Left Arrow */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-10 rounded-none rounded-r-md"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Banner Content */}
        <div className="w-full h-full flex items-center">
          {/* Left Side Image */}
          <div className="w-2/5 h-full relative">
            <Image
              src="/placeholder.svg"
              alt="International travel promotion with plane and landmarks"
              fill
              className="object-contain object-bottom-left"
            />
          </div>

          {/* Right Side Text Content */}
          <div className="w-3/5 flex flex-col items-center text-white text-center z-10 space-y-3">
            <div className="flex items-center space-x-4">
              <div className="bg-white text-blue-600 px-4 py-2 rounded font-bold">
                Travel Logo
              </div>
              <div className="bg-white text-green-600 px-4 py-2 rounded font-bold">
                Lowest Fare
              </div>
            </div>
            <h2 className="text-3xl font-bold">Save on international!!</h2>
            <p className="text-4xl font-bold">Up to ₹25,000 Off</p>
            <p className="text-lg">Book now</p>
            <div className="bg-white text-blue-600 font-mono tracking-widest text-lg px-4 py-2 rounded-lg shadow-lg">
              CODE: FKINT
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-10 rounded-none rounded-l-md"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}