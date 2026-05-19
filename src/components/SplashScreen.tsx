import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505] z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }} // يبدأ مخفي وصغير
        animate={{ opacity: 1, scale: 1 }}    // يظهر ويكبر
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          repeat: 1, 
          repeatType: "reverse", 
          repeatDelay: 1 
        }}
        className="flex flex-col items-center"
      >
        {/* حط مسار شعارك هنا */}
        <img 
          src="/logo.png" 
          alt="Mawrid Logo" 
          className="w-48 md:w-64 h-auto object-contain"
        />
        
        {/* خط تحميل أنيق تحت الشعار */}
        <motion.div 
          className="h-1 bg-red-600 mt-8 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen;