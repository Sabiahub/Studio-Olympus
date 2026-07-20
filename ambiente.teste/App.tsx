import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { galleries, GalleryItem } from "./data";

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedGallery = galleries.find((g) => g.id === selectedId);

  // Prevent scrolling when a gallery is expanded
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans flex items-center justify-center">
      {/* Grid Layout */}
      <main className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 auto-rows-[200px] md:auto-rows-[300px]">
          {galleries.map((gallery) => (
            <motion.div
              layoutId={`card-container-${gallery.id}`}
              key={gallery.id}
              onClick={() => setSelectedId(gallery.id)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <motion.img
                layoutId={`image-${gallery.id}`}
                src={gallery.coverImage}
                alt={gallery.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <motion.div
                layoutId={`overlay-${gallery.id}`}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6"
              >
                <motion.h2
                  layoutId={`title-${gallery.id}`}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {gallery.title}
                </motion.h2>
                <motion.p
                  layoutId={`desc-${gallery.id}`}
                  className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0"
                >
                  {gallery.description}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Expanded View */}
      <AnimatePresence>
        {selectedId && selectedGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`card-container-${selectedId}`}
              className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                onClick={() => setSelectedId(null)}
              >
                <X size={24} />
              </button>

              <div className="relative h-64 md:h-96 w-full shrink-0">
                <motion.img
                  layoutId={`image-${selectedId}`}
                  src={selectedGallery.coverImage}
                  alt={selectedGallery.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <motion.div
                  layoutId={`overlay-${selectedId}`}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8"
                >
                  <motion.h2
                    layoutId={`title-${selectedId}`}
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                  >
                    {selectedGallery.title}
                  </motion.h2>
                  <motion.p
                    layoutId={`desc-${selectedId}`}
                    className="text-gray-200 text-lg max-w-2xl"
                  >
                    {selectedGallery.description}
                  </motion.p>
                </motion.div>
              </div>

              {/* Expanded content (Images) */}
              <div className="p-8 overflow-y-auto bg-gray-50">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Gallery</h3>
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                  {selectedGallery.images.map((imgSrc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      className="break-inside-avoid rounded-xl overflow-hidden"
                    >
                      <img
                        src={imgSrc}
                        alt={`${selectedGallery.title} detail ${index + 1}`}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
