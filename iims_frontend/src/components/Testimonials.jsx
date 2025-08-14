import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";

const testimonials = [
  {
    name: "John Doe",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "CEO, Example Corp",
    feedback:
      "This service is amazing! It has transformed the way we work and improved our efficiency drastically.",
  },
  {
    name: "Jane Smith",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Marketing Manager, XYZ Ltd",
    feedback:
      "Highly recommended! The team is incredibly supportive, and the product is user-friendly.",
  },
  {
    name: "Emily Brown",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    role: "CTO, Tech Innovators",
    feedback:
      "A fantastic experience overall. The attention to detail and quality is top-notch!",
  },
  {
    name: "Michael Johnson",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    role: "Product Manager, InnovateX",
    feedback:
      "Great customer support, and the product really helps streamline our operations.",
  },
  {
    name: "Olivia White",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    role: "Lead Developer, CodeForge",
    feedback:
      "We've been using this product for months, and it has really improved our workflow.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 text-center"
      >
        {/* Swiper Component */}
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={2}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: true,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
          }}
          className="testimonial-swiper"
          breakpoints={{
            640: {
              slidesPerView: 1,
              effect: "slide",
            },
            1024: {
              slidesPerView: 2,
              effect: "coverflow",
              spaceBetween: 40,
            },
          }}
          modules={[Autoplay, Pagination, EffectCoverflow]}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex justify-center p-4"
              >
                <div className="relative bg-gradient-to-br from-white via-blue-50 to-white p-8 rounded-2xl border border-[#33CCFF]/20 shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl hover:ring-4 hover:ring-blue-100 group">
                  {/* Circular Image */}
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#33CCFF] to-[#1A66CC] p-1 group-hover:shadow-xl group-hover:ring-4 group-hover:ring-blue-200 transition-all duration-300">
                      <img
                        src={testimonial.image}
                        alt={`Testimonial from ${testimonial.name}`}
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:shadow-lg transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                  {/* Quote Icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-4xl text-[#2699E6] mb-4"
                  >
                    "
                  </motion.div>
                  {/* Feedback */}
                  <p className="text-gray-600 italic mb-6 text-lg leading-relaxed">
                    {testimonial.feedback}
                  </p>
                  {/* Name and Role */}
                  <div className="border-t border-[#33CCFF]/20 pt-4">
                    <h3 className="text-xl font-bold text-[#1A66CC] mb-1">
                      {testimonial.name}
                    </h3>
                    <p className="text-[#2699E6] font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};

export default Testimonials; 