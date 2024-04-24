"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<WebsiteData | null>(null);

  const crousalArray = [
    "https://assets.mediamodifier.com/mockups/5eb298d9344e64249900dbbc/instagram-post-mockup-maker.jpg",
    "https://img.freepik.com/free-psd/social-media-instagram-post-template_47618-73.jpg?size=338&ext=jpg&ga=GA1.1.2008272138.1713571200&semt=ais",
    "https://i.pinimg.com/736x/2b/1c/35/2b1c357a454e0160af378c3e361693aa.jpg",

  ]

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    setData(data?.data);
  };


  interface FontDetails {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  }

  interface Link {
    href: string;
    text: string;
  }

  interface WebsiteData {
    title: string;
    description: string;
    keywords: string | null;
    primaryColor: string;
    secondaryColor: string;
    fontDetails: FontDetails;
    headerText: string[];
    links: Link[];
    images: string[];
    mainContentText: string;
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <Card className="w-80">
        <CardHeader>
          <CardTitle>Your Brand URL</CardTitle>
          <form onSubmit={handleSubmit}>
            <Input placeholder="your url"
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="flex justify-center">
              <Button type="submit" variant="outline" className="w-full rounded m-6">Submit</Button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              duration: 200,
              dragThreshold: 100,
            }}
          >
            <CarouselContent>
              {crousalArray.map((imgSrc) =>
                <CarouselItem><img src={imgSrc} alt="image" /> </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
        </CardContent>
        <CardFooter>
          <small>please input text so that we can analyize you branding</small>
        </CardFooter>


      </Card>

      {data && (
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
          <p className="text-sm text-gray-600">{data.description}</p>

          <div className="flex items-center space-x-2">
            <strong className="text-sm">Primary Color:</strong>
            <div className="w-6 h-6 rounded-full border-2 border-slate-200" style={{ backgroundColor: data.primaryColor }}></div>
            <span className="text-sm">{data?.primaryColor}</span>
          </div>

          {/* Secondary Color */}
          <div className="flex items-center space-x-2">
            <strong className="text-sm">Secondary Color:</strong>
            <div className="w-6 h-6 rounded-full border-2 border-slate-200" style={{ backgroundColor: data.secondaryColor }}></div>
            <span className="text-sm">{data?.secondaryColor}</span>
          </div>
          <div className="text-sm">
            <strong>Font:</strong> {data?.fontDetails?.fontFamily}, {data.fontDetails?.fontSize}
          </div>
          <div className="space-y-2">
            <strong>Headers Found:</strong>
            <ul className="list-disc pl-5">
              {data.headerText.map((text, index) => (
                <li key={index} className="text-sm text-gray-800">{text}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Links:</strong>
            <ul className="list-disc pl-5">
              {data.links.map((link, index) => (
                <li key={index} className="text-sm text-blue-600 hover:text-blue-800">
                  <a href={link.href} target="_blank" rel="noopener noreferrer">{link.text || link.href}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {data.images.map((imgSrc, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                <img src={imgSrc} alt={`Image ${index + 1}`} className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110" />
              </div>
            ))}
          </div>
        </div>

      )}
    </main>
  );
}