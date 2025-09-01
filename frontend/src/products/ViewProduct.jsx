import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Share2 } from "lucide-react"; // ✅ Share icon
import ProductModal from "./ProductModal";
import api from "../Axios/api";
import { AlertConfirm } from "../common/AlertConfirm";
import { useSelector } from "react-redux";
import ProductEditModal from "./ProductEditModal";
import Review from "../user/Review";
// ✅ Reusable Chat Dialog


export default function ViewProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [openChat, setOpenChat] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [openReport, setOpenReport] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
const [reportDescription, setReportDescription] = useState("");

  console.log(currentUser);
  const userId = currentUser?.user?.id || undefined;
  console.log(userId);
  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      if (!res.data) {
        toast.error("Product not found!");
        return;
      }
      setProduct(res.data);
    } catch (err) {
      console.error("Error fetching product:", err);
      toast.error("Failed to fetch product!");
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (!product) return null; // Or a loader/spinner

  const RemoveProduct = async () => {
    try {
      await api.delete(`/products/deleteProduct/${id}`);
      toast.success("Product removed successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Failed to remove product. Please try again.");
    }
  };

  const handleReport = async (reason) => {
    try {
      await api.post("/reports", {
        product: product._id, // <- make sure product exists
        reason,
      });
      toast.success("Report submitted successfully!");
      setOpenReport(false);
    } catch (error) {
      console.error("Error sending report:", error);
      toast.error("Failed to send report");
    }
  };

  // Prepare product object for UI
  const productData = {
    title: product.title,
    price: `₹ ${product.price}`,
    category: product.category?.name || "Unknown",
    description: product.description,
    images:
      product.images?.length > 0
        ? product.images.map(
            (img) => `http://localhost:5000/${img.replaceAll("\\", "/")}`
          )
        : [
            "https://dummyimage.com/600x400/000/fff&text=Front+View",
            "https://dummyimage.com/600x400/111/fff&text=Back+View",
            "https://dummyimage.com/600x400/222/fff&text=Side+View",
          ],
    owner: {
      name: product.seller?.fullName || "Sonal Sharma",
      avatar:
        product.seller?.profileImage?.trim() !== ""
          ? product.seller.profileImage
          : "https://i.pravatar.cc/150?img=32",
      location: product.location?.coordinates
        ? `${product.location.coordinates[1]}, ${product.location.coordinates[0]}`
        : "Unknown",
    },
  };

  const activeChats = [
    { id: 1, name: "Sonal Sharma", avatar: "https://i.pravatar.cc/150?img=32" },
    { id: 2, name: "Rahul Mehta", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: 3, name: "Aditi Verma", avatar: "https://i.pravatar.cc/150?img=45" },
  ];

  console.log("product id " + product._id);
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
          {/* Carousel */}
          <Carousel className="w-full mb-6 relative">
            <CarouselContent>
              {productData.images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="p-2">
                    <Card>
                      <CardContent className="flex items-center justify-center p-4">
                        <img
                          src={img}
                          alt={`Product ${index}`}
                          className="rounded-xl object-contain h-96 w-full"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md" />
          </Carousel>

          {/* Product Info */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {productData.title}
                </CardTitle>
                <CardDescription className="text-lg text-green-600 font-semibold">
                  {productData.price}
                </CardDescription>
              </div>

              {/* ✅ Share Button */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  const shareData = {
                    title: productData.title,
                    text: `Check out this product: ${productData.title}`,
                    url: window.location.href,
                  };

                  if (navigator.share) {
                    navigator
                      .share(shareData)
                      .catch((err) => console.log("Share failed:", err));
                  } else {
                    navigator.clipboard.writeText(shareData.url);
                    toast.info("Link copied to clipboard!");
                  }
                }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>

              {userId === product.seller?._id && (
                <ProductEditModal
                  title={"Edit Product "}
                  productId={product._id}
                  buttonName={<Edit />}
                  onUpdate={fetchProduct}
                />
              )}
            </CardHeader>

            <CardContent>
              <p className="mb-2">
                <span className="font-semibold">Category:</span>{" "}
                {productData.category}
              </p>
              <p className="text-gray-600">{productData.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* Contact Owner */}
          <Card>
            <CardHeader>
              {userId === product.seller?._id ? (
                <CardTitle className="text-lg font-bold">Actions</CardTitle>
              ) : (
                <CardTitle className="text-lg font-bold">
                  Contact Owner
                </CardTitle>
              )}
              {userId !== product.seller?._id && (
                <CardDescription>
                  {productData.owner.name} - {productData.owner.location}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {userId !== product.seller?._id && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    onClick={() => {
                      navigate("/chatdashboard", {
                        state: {
                          receiverId: product.seller?._id, // Owner's user ID
                          productId: product._id, // Product ID to attach
                        },
                      });
                    }}
                  >
                    Chat with Owner 
                  </Button>
                  {/* <ChatDialog /> */}
                  {/* <Button variant="outline" className="w-full">
                    Call Now
                  </Button> */}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setOpenReport(true)}
                  >
                    Report Product
                  </Button>
                </>
              )}
              {/* <Button variant="destructive" className="w-full">
                Remove Product
              </Button> */}
              {userId === product.seller?._id && product.status !== "sold" && (
                <>
                  <AlertConfirm
                    triggerText={"Remove Product"}
                    title="Remove Product?"
                    description="This action will permanently delete the Product."
                    confirmText="Delete"
                    cancelText="Cancel"
                    triggerVariant="destructive"
                    onConfirm={() => RemoveProduct()}
                  />
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      try {
                        await api.patch(`/products/${product._id}/sold`);
                        toast.success("Product marked as sold!");
                        // Refresh page
                        window.location.reload();
                      } catch (error) {
                        console.error("Error marking product as sold:", error);
                        toast.error("Failed to mark product as sold.");
                      }
                    }}
                  >
                    Mark as Sold
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

         
        </div>
      </div>

      {/* Report Dialog */}
      {/* Report Dialog */}
      <Dialog open={openReport} onOpenChange={setOpenReport}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this Product</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {[
              "Misleading Information",
              "Scam / Fraud",
              "Offensive Content",
              "Duplicate Listing",
              "Other",
            ].map((reason) => (
              <Button
        key={reason}
        variant="outline"
        className="justify-start"
        onClick={async () => {
          try {
            await api.post("/reports/", {
              product: product._id,
              reason,
              description: reportDescription, // ✅ Add description here
            });
            toast.success("Report submitted successfully!");
            setOpenReport(false);
            setReportDescription(""); // reset after sending
          } catch (error) {
            console.error("Error reporting product:", error);
            toast.error("Failed to submit report.");
          }
        }}
      >
        {reason}
      </Button>
            ))}
            <textarea
      value={reportDescription}
      onChange={(e) => setReportDescription(e.target.value)}
      placeholder="Add additional details (optional)"
      className="mt-2 p-2 border rounded-md w-full text-sm"
      rows={3}
    ></textarea>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            (Reporting is sent to admin for review.)
          </p>
        </DialogContent>
      </Dialog>
      <Review productId={product._id} user={userId}  />
    </div>
  );
}
