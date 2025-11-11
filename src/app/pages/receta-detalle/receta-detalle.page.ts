// receta-detalle.page.ts - VERSIÓN CORREGIDA SIN ERRORES
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanesService, Receta } from '../../services/planes.service';
import { AuthService } from '../../services/auth.service';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-receta-detalle',
  templateUrl: './receta-detalle.page.html',
  styleUrls: ['./receta-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RecetaDetallePage implements OnInit, OnDestroy {
  receta: Receta | null = null;
  recetaId: string = '';
  alimentosEvitar: string[] = []; // Alimentos que el usuario quiere evitar
  ingredientesProblema: string[] = []; // Ingredientes que coinciden con alimentos a evitar
  currentUser: User | null = null;
  cargando: boolean = true;

  // ✅ NUEVO: Gradient fijo basado en recetaId
  gradientFijo: string = '';

  private destroy$ = new Subject<void>();

  // ✅ CORREGIDO: Usar inject() para servicios de Firebase
  private firestore = inject(Firestore);
  private planesService = inject(PlanesService);
  private authService = inject(AuthService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.recetaId = this.route.snapshot.paramMap.get('id') || '';
    
    // ✅ CORREGIDO: Generar gradient fijo ANTES de cargar datos
    this.gradientFijo = this.generarGradientFijo(this.recetaId);
    
    // ✅ CORREGIDO: Cargar datos de forma segura
    await this.cargarDatosIniciales();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ NUEVO: Método para generar gradient fijo y estable
  private generarGradientFijo(recetaId: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    
    // ✅ GENERAR HASH ESTABLE basado en recetaId
    let hash = 0;
    for (let i = 0; i < recetaId.length; i++) {
      hash = ((hash << 5) - hash) + recetaId.charCodeAt(i);
      hash = hash & hash; // Convertir a 32-bit integer
    }
    
    const index = Math.abs(hash) % gradients.length;
    console.log(`🎨 Gradient generado para receta ${recetaId}: índice ${index}`);
    return gradients[index];
  }

  // ✅ NUEVO: Método unificado para cargar datos iniciales
  private async cargarDatosIniciales() {
    try {
      this.cargando = true;
      
      // Suscribirse al usuario autenticado
      this.authService.user
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (user) => {
          if (user) {
            this.currentUser = user;
            
            // Cargar alimentos a evitar del usuario
            await this.cargarAlimentosEvitar(user.uid);
            
            // Cargar receta después de tener los alimentos a evitar
            await this.cargarReceta();
          } else {
            // Si no hay usuario, solo cargar la receta
            await this.cargarReceta();
          }
        });

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      this.cargando = false;
    }
  }

  // ✅ CORREGIDO: Manejo seguro de la suscripción a Firestore
  private async cargarAlimentosEvitar(uid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const userDoc = doc(this.firestore, 'usuarios', uid);
        
        const alimentosSub = docData(userDoc)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (userData: any) => {
              this.alimentosEvitar = userData?.configuracionPlanes?.alimentosEvitar || [];
              console.log('✅ Alimentos a evitar cargados:', this.alimentosEvitar);
              resolve();
            },
            error: (error) => {
              console.error('Error cargando alimentos a evitar:', error);
              reject(error);
            }
          });

        // Agregar al destroy$ para limpieza automática
        this.destroy$.subscribe(() => alimentosSub.unsubscribe());

      } catch (error) {
        console.error('Error en cargarAlimentosEvitar:', error);
        reject(error);
      }
    });
  }

  // ✅ CORREGIDO: Método mejorado para cargar receta
  private async cargarReceta() {
    try {
      if (this.recetaId) {
        // Cargar receta por ID desde el servicio
        this.receta = await this.planesService.obtenerRecetaPorId(this.recetaId);
      } else {
        // Intentar obtener la receta del state de navegación
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
          this.receta = navigation.extras.state['receta'];
        }
      }

      if (this.receta) {
        console.log('✅ Receta cargada:', this.receta.titulo);
        this.verificarAlimentosProblema();
      } else {
        console.error('❌ No se pudo cargar la receta');
        this.mostrarErrorReceta();
      }

    } catch (error) {
      console.error('Error cargando receta:', error);
      this.mostrarErrorReceta();
    }
  }

  // ✅ NUEVO: Manejo de errores al cargar receta
  private async mostrarErrorReceta() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'No se pudo cargar la receta. Inténtalo de nuevo.',
      buttons: [
        {
          text: 'Volver',
          handler: () => {
            this.goBack();
          }
        }
      ]
    });
    await alert.present();
  }

  // ✅ CORREGIDO: Método mejorado para verificar alimentos problema
  private verificarAlimentosProblema() {
    if (!this.receta || !this.alimentosEvitar.length) {
      this.ingredientesProblema = [];
      return;
    }

    this.ingredientesProblema = [];

    // Verificar cada ingrediente de la receta
    this.receta.ingredientes.forEach(ingrediente => {
      const nombreIngrediente = ingrediente.nombre.toLowerCase().trim();
      
      // Buscar coincidencias en alimentos a evitar
      this.alimentosEvitar.forEach(alimentoEvitar => {
        const alimento = alimentoEvitar.toLowerCase().trim();
        
        // Coincidencia exacta o parcial (solo si ambos strings tienen contenido)
        if (nombreIngrediente && alimento && 
            (nombreIngrediente.includes(alimento) || alimento.includes(nombreIngrediente))) {
          if (!this.ingredientesProblema.includes(ingrediente.nombre)) {
            this.ingredientesProblema.push(ingrediente.nombre);
          }
        }
      });
    });

    // Mostrar alerta si hay ingredientes problemáticos
    if (this.ingredientesProblema.length > 0) {
      console.log('⚠️ Ingredientes problema detectados:', this.ingredientesProblema);
      this.mostrarAlertaAlimentosEvitar();
    } else {
      console.log('✅ No se detectaron ingredientes problema');
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

  private generarMensajeAlerta(): string {
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

  private generarSugerenciasSustitucion(): string {
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

  private obtenerSustituciones(ingrediente: string): string[] {
    const sustituciones: { [key: string]: string[] } = {
      'champiñones': ['pimientos', 'calabacín', 'berenjena', 'zanahoria'],
      'pollo': ['tofu', 'tempeh', 'lentejas', 'garbanzos', 'setas'],
      'carne': ['lentejas', 'garbanzos', 'tofu', 'seitán', 'judías'],
      'pescado': ['tofu', 'tempeh', 'lentejas', 'garbanzos'],
      'mariscos': ['setas', 'tofu', 'berenjena', 'calabacín'],
      'lácteos': ['leche vegetal', 'yogur vegetal', 'tofu', 'aguacate'],
      'gluten': ['harina de almendra', 'harina de coco', 'harina de arroz', 'quinoa'],
      'huevos': ['semillas de chía', 'linaza molida', 'puré de manzana', 'tofu sedoso'],
      'leche': ['leche de almendra', 'leche de avena', 'leche de coco'],
      'queso': ['tofu ahumado', 'levadura nutricional', 'queso vegetal']
    };

    // Buscar coincidencias parciales
    const ingredienteLower = ingrediente.toLowerCase();
    for (const [key, values] of Object.entries(sustituciones)) {
      if (ingredienteLower.includes(key) || key.includes(ingredienteLower)) {
        return values;
      }
    }

    // Sustituciones genéricas si no hay coincidencia específica
    return ['busca alternativas similares', 'modifica según tus gustos', 'consulta con un nutricionista'];
  }

  irAPerfil() {
    this.router.navigate(['/perfil']);
  }

  // ✅ MEJORADO: Sistema de iconos inteligente por categoría
  getFoodIcon(): string {
    if (!this.receta) return '🍽️';

    const iconMap: { [key: string]: string } = {
      // Desayunos
      'desayuno': '🥞', 'desayunos': '🥞', 'breakfast': '🥞',
      
      // Almuerzos
      'almuerzo': '🍲', 'almuerzos': '🍲', 'lunch': '🍲',
      
      // Cenas
      'cena': '🍛', 'cenas': '🍛', 'dinner': '🍛',
      
      // Postres
      'postre': '🍰', 'postres': '🍰', 'dessert': '🍰',
      
      // Ensaladas
      'ensalada': '🥗', 'ensaladas': '🥗', 'salad': '🥗',
      
      // Sopas
      'sopa': '🍜', 'sopas': '🍜', 'soup': '🍜',
      
      // Comida rápida/snacks
      'snack': '🍕', 'snacks': '🍕', 'rápida': '🍕',
      
      // Bebidas
      'bebida': '🥤', 'bebidas': '🥤', 'drink': '🥤',
      
      // Ingredientes específicos
      'huevo': '🥚', 'huevos': '🥚', 'egg': '🥚',
      'pescado': '🐟', 'fish': '🐟',
      'pollo': '🍗', 'chicken': '🍗',
      'carne': '🥩', 'meat': '🥩',
      'vegetales': '🥦', 'vegetarian': '🥦', 'vegano': '🥦',
      'fruta': '🍎', 'frutas': '🍎', 'fruit': '🍎',
      'arroz': '🍚', 'rice': '🍚',
      'pasta': '🍝', 'pasta ': '🍝',
      'pan': '🍞', 'bread': '🍞',
      'queso': '🧀', 'cheese': '🧀'
    };

    // Buscar por categoría
    const categoria = this.receta.categoria?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoria.includes(key)) {
        return icon;
      }
    }

    // Buscar por título
    const titulo = this.receta.titulo?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
      if (titulo.includes(key)) {
        return icon;
      }
    }

    // Buscar por ingredientes principales
    if (this.receta.ingredientes && this.receta.ingredientes.length > 0) {
      const ingredientesTexto = this.receta.ingredientes
        .map(ing => ing.nombre?.toLowerCase() || '')
        .join(' ');
      
      for (const [key, icon] of Object.entries(iconMap)) {
        if (ingredientesTexto.includes(key)) {
          return icon;
        }
      }
    }

    // Icono por defecto basado en el tipo de dieta
    const dietaIcons: { [key: string]: string } = {
      'vegetariana': '🥗',
      'vegana': '🌱',
      'proteica': '💪',
      'keto': '🥑',
      'mediterranea': '🍅',
      'baja en calorías': '🥬'
    };

    for (const [dieta, icon] of Object.entries(dietaIcons)) {
      if (this.receta.tipoDieta?.some(td => td.toLowerCase().includes(dieta))) {
        return icon;
      }
    }

    // Icono completamente aleatorio como último recurso
    const icons = ['🍳', '🥗', '🍲', '🥣', '🍛', '🍝'];
    const randomIndex = Math.floor(Math.random() * icons.length);
    return icons[randomIndex];
  }

  // ✅ ELIMINADO: getGradient() - Reemplazado por gradientFijo

  goBack() {
    this.router.navigate(['/planes']);
  }

  // ✅ NUEVO: Método para ver estado de carga
  isLoading(): boolean {
    return this.cargando;
  }
}