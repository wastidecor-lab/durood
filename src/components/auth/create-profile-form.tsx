"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import type { User } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  whatsapp: z.string().min(10, { message: "Please enter a valid WhatsApp number." }),
  profilePicture: z.any().optional(),
});

export function CreateProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("newUserEmail");
    if (!email) {
      // Redirect if user lands here without signing up first
      router.push("/signup");
    } else {
      setNewUserEmail(email);
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      whatsapp: "",
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        form.setValue("profilePicture", reader.result as string); // Store as data URI
      };
      reader.readAsDataURL(file);
    }
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!newUserEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try signing up again.",
      });
      router.push("/signup");
      return;
    }

    const newUser: User = {
      email: newUserEmail,
      name: values.name,
      city: values.city,
      whatsapp: values.whatsapp,
      // Don't save the picture in the main user object to avoid storage quota issues
      profilePicture: "",
      stats: { today: 0, week: 0, allTime: 0 },
      lastUpdated: new Date().toISOString(),
    };

    // Save the new user to the users array in localStorage
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = [...users, newUser];


    try {
      // This is the main user list without profile pictures
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Could not save user data. The browser storage might be full.",
      });
      return;
    }

    // "Log in" the new user
    localStorage.setItem("loggedInUser", newUserEmail);
    // Store profile picture separately for the logged-in user session
    if (values.profilePicture) {
      try {
        localStorage.setItem(`${newUserEmail}-profilePicture`, values.profilePicture);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Image Too Large",
          description: "Your profile picture is too large to be saved. Please choose a smaller image.",
        });
        // We can still proceed without the profile picture
      }
    }
    localStorage.removeItem("newUserEmail");


    toast({
      title: "Profile Created!",
      description: "Welcome to the community!",
    });
    router.push("/dashboard");
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline text-primary">Complete Your Profile</CardTitle>
        <CardDescription>Just a few more details to get you started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
               <Avatar className="h-24 w-24">
                  {previewImage ? (
                    <AvatarImage src={previewImage} alt="Profile preview" />
                  ) : (
                     <AvatarImage src={`https://placehold.co/100x100.png`} alt="placeholder" data-ai-hint="profile avatar"/>
                  )}
                  <AvatarFallback>
                    <UserIcon className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Madinah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold">Save and Continue</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
