// receta-detalle.page.ts - VERSIÓN CORREGIDA CON RUTA CORRECTA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
// ✅ CORREGIR ESTA LÍNEA - La ruta ahora es diferente
import { PlanesService, Receta } from '../../services/planes.service';

@Component({
  selector: 'app-receta-detalle',
  templateUrl: './receta-detalle.page.html',
  styleUrls: ['./receta-detalle.page.scss'], // ✅ CORREGIDO: usar el archivo SCSS que creamos
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RecetaDetallePage implements OnInit {
  receta: Receta | null = null;
  recetaId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planesService: PlanesService
  ) {}

  async ngOnInit() {
    this.recetaId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.recetaId) {
      await this.cargarReceta();
    } else {
      // Si no hay ID, intentar obtener la receta del state
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.receta = navigation.extras.state['receta'];
      }
    }
  }

  async cargarReceta() {
    try {
      this.receta = await this.planesService.obtenerRecetaPorId(this.recetaId);
    } catch (error) {
      console.error('Error cargando receta:', error);
    }
  }

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