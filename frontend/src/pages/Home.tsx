import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Award,
  Users,
  FileText,
  Download,
  ArrowRight,
  Star,
  BookOpen,
  Trophy,
  ImageIcon,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Importações das novas imagens
const febicLogo = "/assets/febic-logo.png";
const heroImage = "/assets/images/imagem_site_hero.jpg";
const aboutImage = "/assets/images/about_section.jpg";
const aboutOverlayLogo ="/assets/febic-logo.png";
const newsImage1 = "/assets/images/new_section1.jpg";
const newsImage2 = "/assets/images/new_section2.jpg";
const newsImage3  = "/assets/images/new_section3.jpg";
const galleryImage1 = "../assets/images/galeria1.jpg";
const galleryImage2 = "../assets/images/galeria2.jpg";
const galleryImage3 = "../assets/images/galeria3.jpg";
const galleryImage4 = "../assets/images/galeria4.jpg";
const galleryImage5 = "../assets/images/galeria5.jpg";
const galleryImage6 = "../assets/images/galeria6.jpg";

const Home = () => {
  // Hook para controlar visibilidade do header baseado no scroll
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = window.innerHeight * 0.1; // 10% da altura da viewport
      
      if (currentScrollY > scrollThreshold) {
        // Passamos de 10% da página
        if (currentScrollY > lastScrollY) {
          // Rolando para baixo - esconder header
          setIsHeaderVisible(false);
        } else {
          // Rolando para cima - mostrar header
          setIsHeaderVisible(true);
        }
      } else {
        // Menos de 10% da página - sempre mostrar
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Função para scroll suave até as seções
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 64; // Altura do header fixo (h-16 = 64px)
      const offsetTop = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const scheduleItems = [
    { date: "15/03/2025", event: "Abertura das Inscrições", status: "upcoming" },
    { date: "30/04/2025", event: "Encerramento das Inscrições", status: "upcoming" },
    { date: "15/05/2025", event: "Divulgação dos Selecionados", status: "upcoming" },
    { date: "01/06/2025", event: "Etapa Virtual", status: "upcoming" },
    { date: "15/07/2025", event: "Etapa Presencial", status: "upcoming" },
  ];

  const newsItems = [
    {
      title: "FEBIC 2025: Inscrições Abertas",
      description: "Estão abertas as inscrições para a FEBIC 2025. Participe da maior feira de iniciação científica do Brasil.",
      date: "15 Mar 2025",
      image: newsImage1
    },
    {
      title: "Novos Critérios de Avaliação",
      description: "Confira os novos critérios de avaliação para projetos da FEBIC 2025.",
      date: "10 Mar 2025",
      image: newsImage2
    },
    {
      title: "Premiações FEBIC 2024",
      description: "Veja os ganhadores e projetos premiados da edição anterior.",
      date: "05 Mar 2025",
      image: newsImage3
    }
  ];

  const galleryImages = [
    galleryImage1,
    galleryImage2, 
    galleryImage3,
    galleryImage4,
    galleryImage5,
    galleryImage6
  ];

  const awards = [
    { name: "Prêmio de Excelência", icon: Trophy, color: "text-yellow-500" },
    { name: "Inovação Tecnológica", icon: Star, color: "text-primary" },
    { name: "Sustentabilidade", icon: Award, color: "text-green-500" },
    { name: "Inclusão Social", icon: Users, color: "text-pink-accent" }
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header/Navigation - Logo transparente sem bordas + scroll inteligente */}
      <header className={`fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-500 ease-in-out shadow-elegant ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-8 sm:px-12 lg:px-16">
          <div className="flex items-center gap-4">
            <img src={febicLogo} alt="FEBIC Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-primary">FEBIC 2025</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="text-sm font-medium hover:text-primary transition-smooth cursor-pointer"
            >
              Início
            </button>
            <button 
              onClick={() => scrollToSection('sobre')} 
              className="text-sm font-medium hover:text-primary transition-smooth cursor-pointer"
            >
              Sobre
            </button>
            <button 
              onClick={() => scrollToSection('cronograma')} 
              className="text-sm font-medium hover:text-primary transition-smooth cursor-pointer"
            >
              Cronograma
            </button>
            <button 
              onClick={() => scrollToSection('regulamento')} 
              className="text-sm font-medium hover:text-primary transition-smooth cursor-pointer"
            >
              Regulamento
            </button>
            <button 
              onClick={() => scrollToSection('noticias')} 
              className="text-sm font-medium hover:text-primary transition-smooth cursor-pointer"
            >
              Notícias
            </button>
            <button 
              onClick={() => scrollToSection('contato')} 
              className="text-sm font-medium hover:text-primary transition-smooth cursor-pointer"
            >
              Contato
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hover-lift" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="bg-gradient-primary hover-glow" asChild>
              <Link to="/register">Inscrever-se</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Botão "Saiba Mais" igual ao "Inscrever Projeto" */}
      <section className="relative py-20 lg:py-32 bg-gradient-hero -mt-16 pt-36 lg:pt-48">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-8 sm:px-12 lg:px-16">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit bg-white/20 text-white border-white/30">
                FEBIC 2025
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-white">
                Feira Brasileira de 
                <span className="text-yellow-300"> Iniciação Científica</span>
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Promovendo a educação científica e a inovação através da pesquisa. 
                Participe da maior feira de iniciação científica do Brasil.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group bg-white text-primary hover:bg-white/90 hover-lift" asChild>
                <Link to="/register">
                  Inscrever Projeto
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 hover-lift" 
                onClick={() => scrollToSection('sobre')}
              >
                Saiba Mais
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">700+</div>
                <div className="text-sm text-white/80">Projetos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">450+</div>
                <div className="text-sm text-white/80">Finalistas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">26</div>
                <div className="text-sm text-white/80">Estados</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={heroImage} 
              alt="FEBIC Hero - Feira de Iniciação Científica" 
              className="w-full h-auto rounded-2xl shadow-elegant hover-lift"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl"></div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Section - Com logo overlay na direita */}
      <section id="sobre" className="py-20 bg-gradient-section-1 relative overflow-hidden">
        {/* Logo Overlay - Parte Direita */}
        <div className="absolute top-0 right-0 h-full w-1/3 flex items-center justify-end opacity-20 z-0">
          <img 
            src={aboutOverlayLogo} 
            alt="FEBIC Overlay Logo" 
            className="h-full w-auto object-contain max-w-none"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">O que é a FEBIC?</h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              A Feira Brasileira de Iniciação Científica é um evento dedicado ao fomento 
              da pesquisa científica entre estudantes de todos os níveis educacionais.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={aboutImage} 
                alt="Sobre FEBIC - Educação Científica" 
                className="w-full h-auto rounded-xl shadow-elegant hover-lift"
              />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white">Nossos Objetivos</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 shrink-0"></div>
                    <span className="text-white/90">Incentivar o interesse pela pesquisa científica</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 shrink-0"></div>
                    <span className="text-white/90">Promover a interdisciplinaridade e transversalidade</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 shrink-0"></div>
                    <span className="text-white/90">Estimular a inovação e sustentabilidade</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 shrink-0"></div>
                    <span className="text-white/90">Popularizar a ciência na sociedade</span>
                  </li>
                </ul>
              </div>
              
              <Button className="bg-white text-primary hover:bg-white/90 hover-lift" asChild>
                <Link to="/register">
                  Participar da FEBIC
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section - Cards brancos com texto visível */}
      <section id="cronograma" className="py-20 bg-gradient-section-2">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Cronograma FEBIC 2025</h2>
            <p className="text-lg text-white/90">
              Fique por dentro de todas as datas importantes do evento
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {scheduleItems.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-primary bg-white shadow-elegant hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.event}</h3>
                          <p className="text-sm text-gray-600">{item.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary text-white border-none font-medium">Em breve</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regulation Section - Botões com texto PRETO e mesma posição */}
      <section id="regulamento" className="py-20 bg-gradient-section-3">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Regulamento</h2>
            <p className="text-lg text-white/90">
              Confira todas as informações e documentos necessários
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-lift bg-white/10 backdrop-blur border-white/20 flex flex-col h-full">
              <CardHeader className="flex-grow">
                <FileText className="w-8 h-8 text-white mb-2" />
                <CardTitle className="text-white">Regulamento Geral</CardTitle>
                <CardDescription className="text-white/80">
                  Documento completo com todas as regras e diretrizes da FEBIC 2025
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full bg-white text-black border-white hover:bg-white/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift bg-white/10 backdrop-blur border-white/20 flex flex-col h-full">
              <CardHeader className="flex-grow">
                <BookOpen className="w-8 h-8 text-white mb-2" />
                <CardTitle className="text-white">Manual do Participante</CardTitle>
                <CardDescription className="text-white/80">
                  Guia prático para participantes com dicas e orientações importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full bg-white text-black border-white hover:bg-white/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift bg-white/10 backdrop-blur border-white/20 flex flex-col h-full">
              <CardHeader className="flex-grow">
                <Award className="w-8 h-8 text-white mb-2" />
                <CardTitle className="text-white">Critérios de Avaliação</CardTitle>
                <CardDescription className="text-white/80">
                  Saiba como os projetos serão avaliados em cada categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full bg-white text-black border-white hover:bg-white/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section - "Ler mais" em preto */}
      <section id="noticias" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Últimas Notícias</h2>
            <p className="text-lg text-muted-foreground">
              Fique atualizado com as novidades da FEBIC
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((news, index) => (
              <Card key={index} className="hover-lift overflow-hidden shadow-elegant">
                <div className="aspect-video">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="text-sm text-muted-foreground mb-2">{news.date}</div>
                  <CardTitle className="line-clamp-2">{news.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {news.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="p-0 text-black hover:text-black/80">
                    Ler mais
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 bg-gradient-section-4">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Galeria de Fotos</h2>
            <p className="text-lg text-white/90">
              Momentos especiais das edições anteriores da FEBIC
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg aspect-square hover-lift">
                <img 
                  src={image} 
                  alt={`Galeria FEBIC ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section - Cards diferentes do background */}
      <section className="py-20 bg-gradient-section-5">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Prêmios e Reconhecimentos</h2>
            <p className="text-lg text-white/90">
              Conheça as categorias de premiação da FEBIC
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award, index) => (
              <Card key={index} className="text-center hover-lift bg-white border-white/20 shadow-elegant">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <award.icon className={`w-6 h-6 text-primary`} />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{award.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Annals Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Anais FEBIC</h2>
            <p className="text-lg text-muted-foreground">
              Acesse os trabalhos publicados nas edições anteriores
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[2024, 2023, 2022].map((year) => (
              <Card key={year} className="hover-lift shadow-elegant">
                <CardHeader>
                  <CardTitle>Anais FEBIC {year}</CardTitle>
                  <CardDescription>
                    Trabalhos publicados na edição de {year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar Anais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Realização Section - POSICIONADA APÓS ANAIS (sem instruções) */}
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">Realização</h2>
            <p className="text-lg text-muted-foreground">
              Instituições que tornam a FEBIC possível
            </p>
          </div>

          {/* Organizadores Principais */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground tracking-wider">ORGANIZADORES</h3>
            <div className="flex justify-center items-center gap-12 flex-wrap">
              <div className="bg-gradient-to-br from-white to-muted/50 rounded-xl p-8 w-40 h-24 flex items-center justify-center hover-lift transition-all duration-500 hover:shadow-elegant hover:scale-105 border border-muted/30">
                <span className="text-sm font-bold text-primary">IBIC</span>
              </div>
              <div className="bg-gradient-to-br from-white to-muted/50 rounded-xl p-8 w-40 h-24 flex items-center justify-center hover-lift transition-all duration-500 hover:shadow-elegant hover:scale-105 border border-muted/30">
                <span className="text-sm font-bold text-primary">PARCEIRO</span>
              </div>
            </div>
          </div>

          {/* Patrocinadores */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground tracking-wider">PATROCINADORES</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-muted/50 rounded-xl p-4 w-28 h-20 flex items-center justify-center hover-lift transition-all duration-500 hover:shadow-elegant hover:scale-110 border border-muted/30 group">
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">LOGO</span>
                </div>
              ))}
            </div>
          </div>

          {/* Apoio */}
          <div>
            <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground tracking-wider">APOIO</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 items-center justify-items-center">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-muted/50 rounded-lg p-3 w-24 h-16 flex items-center justify-center hover-lift transition-all duration-500 hover:shadow-elegant hover:scale-110 border border-muted/30 group">
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">APOIO</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Links/Contato - MESMA COR do Regulamento (bg-gradient-section-3) */}
      <section id="contato" className="py-16 bg-gradient-section-3">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={febicLogo} alt="FEBIC Logo" className="h-8 w-auto" />
                <span className="font-bold text-white">FEBIC</span>
              </div>
              <p className="text-sm text-white/90">
                Feira Brasileira de Iniciação Científica - Promovendo a educação científica no Brasil.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Links Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => scrollToSection('sobre')} 
                    className="text-white/80 hover:text-white transition-smooth cursor-pointer"
                  >
                    Sobre
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('cronograma')} 
                    className="text-white/80 hover:text-white transition-smooth cursor-pointer"
                  >
                    Cronograma
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('regulamento')} 
                    className="text-white/80 hover:text-white transition-smooth cursor-pointer"
                  >
                    Regulamento
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('noticias')} 
                    className="text-white/80 hover:text-white transition-smooth cursor-pointer"
                  >
                    Notícias
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Participação</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="text-white/80 hover:text-white transition-smooth">Inscrever Projeto</Link></li>
                <li><Link to="/login" className="text-white/80 hover:text-white transition-smooth">Área do Participante</Link></li>
                <li><Link to="#" className="text-white/80 hover:text-white transition-smooth">Manual do Avaliador</Link></li>
                <li><Link to="#" className="text-white/80 hover:text-white transition-smooth">Feiras Afiliadas</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-white">Contato</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="hover:text-white transition-smooth cursor-pointer">contato@febic.com.br</li>
                <li className="hover:text-white transition-smooth cursor-pointer">(47) 99999-9999</li>
                <li className="hover:text-white transition-smooth cursor-pointer">Jaraguá do Sul - SC</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Final */}
      <footer className="bg-tertiary py-8">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center text-sm text-white/80">
            <p>&copy; FEBIC - Feira Brasileira de Iniciação Científica. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;