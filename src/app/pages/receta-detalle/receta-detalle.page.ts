import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanesService, Receta } from '../../services/planes.service';
import { AuthService } from '../../services/auth.service';
import { doc, docData, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-receta-detalle',
  templateUrl: './receta-detalle.page.html',
  styleUrls: ['./receta-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RecetaDetallePage implements OnInit {
  receta: Receta | null = null;
  recetaId: string = '';
  alimentosEvitar: string[] = []; // Alimentos que el usuario quiere evitar
  ingredientesProblema: string[] = []; // Ingredientes que coinciden con alimentos a evitar

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planesService: PlanesService,
    private authService: AuthService,
    private firestore: Firestore,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.recetaId = this.route.snapshot.paramMap.get('id') || '';
    
    // Cargar alimentos a evitar del usuario
    await this.cargarAlimentosEvitar();
    
    if (this.recetaId) {
      await this.cargarReceta();
    } else {
      // Si no hay ID, intentar obtener la receta del state
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.receta = navigation.extras.state['receta'];
        this.verificarAlimentosProblema();
      }
    }
  }

  async cargarAlimentosEvitar() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        const userDoc = doc(this.firestore, 'usuarios', currentUser.uid);
        docData(userDoc).subscribe({
          next: (userData: any) => {
            this.alimentosEvitar = userData.configuracionPlanes?.alimentosEvitar || [];
            console.log('✅ Alimentos a evitar cargados:', this.alimentosEvitar);
            
            // Si ya tenemos la receta, verificar ingredientes problemáticos
            if (this.receta) {
              this.verificarAlimentosProblema();
            }
          },
          error: (error) => {
            console.error('Error cargando alimentos a evitar:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async cargarReceta() {
    try {
      this.receta = await this.planesService.obtenerRecetaPorId(this.recetaId);
      if (this.receta) {
        this.verificarAlimentosProblema();
      }
    } catch (error) {
      console.error('Error cargando receta:', error);
    }
  }

  verificarAlimentosProblema() {
    if (!this.receta || !this.alimentosEvitar.length) return;

    this.ingredientesProblema = [];

    // Verificar cada ingrediente de la receta
    this.receta.ingredientes.forEach(ingrediente => {
      const nombreIngrediente = ingrediente.nombre.toLowerCase().trim();
      
      // Buscar coincidencias en alimentos a evitar
      this.alimentosEvitar.forEach(alimentoEvitar => {
        const alimento = alimentoEvitar.toLowerCase().trim();
        
        // Coincidencia exacta o parcial
        if (nombreIngrediente.includes(alimento) || alimento.includes(nombreIngrediente)) {
          if (!this.ingredientesProblema.includes(ingrediente.nombre)) {
            this.ingredientesProblema.push(ingrediente.nombre);
          }
        }
      });
    });

    // Mostrar alerta si hay ingredientes problemáticos
    if (this.ingredientesProblema.length > 0) {
      this.mostrarAlertaAlimentosEvitar();
    }
  }

  async mostrarAlertaAlimentosEvitar() {
    const alert = await this.alertController.create({
      header: '⚠️ Alimentos a Evitar Detectados',
      message: this.generarMensajeAlerta(),
      cssClass: 'alerta-alimentos-evitar',
      buttons: [
        {
          text: 'Entendido',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Ver Alternativas',
          cssClass: 'alert-button-alternativas',
          handler: () => {
            this.mostrarSugerenciasSustitucion();
          }
        }
      ]
    });

    await alert.present();
  }

  generarMensajeAlerta(): string {
    if (this.ingredientesProblema.length === 1) {
      return `Esta receta contiene <strong>${this.ingredientesProblema[0]}</strong>, que has indicado que prefieres evitar. Puedes sustituirlo por una alternativa.`;
    } else {
      const ingredientesLista = this.ingredientesProblema.map(ing => `• ${ing}`).join('<br>');
      return `Esta receta contiene ingredientes que prefieres evitar:<br><br>${ingredientesLista}<br><br>Considera sustituirlos por alternativas.`;
    }
  }

  async mostrarSugerenciasSustitucion() {
    const sugerencias = this.generarSugerenciasSustitucion();
    
    const alert = await this.alertController.create({
      header: '💡 Sugerencias de Sustitución',
      message: sugerencias,
      cssClass: 'alerta-sugerencias',
      buttons: [
        {
          text: 'Perfecto, gracias',
          role: 'cancel'
        },
        {
          text: 'Modificar Mis Preferencias',
          handler: () => {
            this.irAPerfil();
          }
        }
      ]
    });

    await alert.present();
  }

  generarSugerenciasSustitucion(): string {
    let sugerencias = '<div class="sugerencias-container">';
    
    this.ingredientesProblema.forEach(ingrediente => {
      const sustituciones = this.obtenerSustituciones(ingrediente);
      sugerencias += `
        <div class="sugerencia-item">
          <strong>${ingrediente}:</strong> ${sustituciones.join(', ')}
        </div>
      `;
    });
    
    sugerencias += `
      <br>
      <small>💡 <strong>Tip:</strong> Siempre puedes adaptar las recetas a tus preferencias personales.</small>
    </div>`;
    
    return sugerencias;
  }

  obtenerSustituciones(ingrediente: string): string[] {
    const sustituciones: { [key: string]: string[] } = {
      'champiñones': ['pimientos', 'calabacín', 'berenjena', 'zanahoria'],
      'pollo': ['tofu', 'tempeh', 'lentejas', 'garbanzos', 'setas'],
      'carne': ['lentejas', 'garbanzos', 'tofu', 'seitán', 'judías'],
      'pescado': ['tofu', 'tempeh', 'lentejas', 'garbanzos'],
      'mariscos': ['setas', 'tofu', 'berenjena', 'calabacín'],
      'lácteos': ['leche vegetal', 'yogur vegetal', 'tofu', 'aguacate'],
      'gluten': ['harina de almendra', 'harina de coco', 'harina de arroz', 'quinoa'],
      'huevos': ['semillas de chía', 'linaza molida', 'puré de manzana', 'tofu sedoso']
    };

    // Buscar coincidencias parciales
    for (const [key, values] of Object.entries(sustituciones)) {
      if (ingrediente.toLowerCase().includes(key) || key.includes(ingrediente.toLowerCase())) {
        return values;
      }
    }

    // Sustituciones genéricas si no hay coincidencia específica
    return ['busca alternativas similares', 'modifica según tus gustos', 'consulta con un nutricionista'];
  }

  irAPerfil() {
    this.router.navigate(['/perfil']);
  }

  // Métodos existentes (sin cambios)
  getGradient(): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    
    const randomIndex = Math.floor(Math.random() * gradients.length);
    return gradients[randomIndex];
  }

  getFoodIcon(): string {
    const icons = ['🍳', '🥗', '🍲', '🥣', '🍛', '🍝', '🍕', '🌮'];
    const randomIndex = Math.floor(Math.random() * icons.length);
    return icons[randomIndex];
  }

  goBack() {
    this.router.navigate(['/planes']);
  }
}