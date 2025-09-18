import { BookOpen, Heart, ExternalLink, Github, Twitter, Linkedin, Mail, ArrowUp } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-3">
            <div className="flex items-center space-x-3 mb-6">
              {/* <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div> */}
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  InterviewShare
                </h3>
                <p className="text-sm text-muted-foreground">College Interview Experiences</p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
              Empowering PSG College of Technology students with authentic interview experiences. 
              Share your journey, inspire others, and build a stronger placement community together.
            </p>
            
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for PSG Tech Students</span>
            </div>
            
            {/* Social Links */}
            
          </div>
          
          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground">Browse</h4>
            <ul className="space-y-3">
              {[
                { name: "View Experiences", href: "/experiences" },
                { name: "Share Experience", href: "/create" },
                { name: "About Us", href: "/about" }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* <div>
            <h4 className="font-semibold mb-6 text-foreground">Community</h4>
            <ul className="space-y-3">
              {[
                { name: "Share Your Story", href: "/create" },
                { name: "Community Guidelines", href: "/about" },
                { name: "About PSG Tech", href: "/about" },
                { name: "Student Resources", href: "/about" },
                { name: "Contact Us", href: "/about", external: true }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-300 inline-flex items-center space-x-1 group"
                  >
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {link.name}
                    </span>
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-border mt-16 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground">
                © {currentYear} PSG College of Technology - Interview Experience Platform
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Empowering students through shared experiences and community support
              </p>
            </div>
            
            <button 
              onClick={scrollToTop}
              className="border border-border hover:bg-secondary/80 transition-all duration-300 hover:scale-105 group px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
