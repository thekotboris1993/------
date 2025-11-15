import math
import fractions
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from typing import List, Tuple

class MillerPlane:
    def __init__(self, h: int, k: int, l: int):
        self.h, self.k, self.l = self.simplify_miller_indices(h, k, l)
    
    @staticmethod
    def simplify_miller_indices(h: int, k: int, l: int) -> Tuple[int, int, int]:
        gcd = math.gcd(math.gcd(abs(h), abs(k)), abs(l))
        if gcd == 0:
            return (h, k, l)
        return (h // gcd, k // gcd, l // gcd)
    
    @classmethod
    def from_intercepts(cls, a: float, b: float, c: float):
        h_inv = 1/a if a != 0 else float('inf')
        k_inv = 1/b if b != 0 else float('inf')
        l_inv = 1/c if c != 0 else float('inf')
        
        fractions_list = []
        for value in [h_inv, k_inv, l_inv]:
            if value != float('inf'):
                fractions_list.append(fractions.Fraction(value).limit_denominator())
            else:
                fractions_list.append(None)
        
        denominators = [f.denominator for f in fractions_list if f is not None]
        if not denominators:
            return cls(0, 0, 0)
        
        common_denominator = 1
        for denom in denominators:
            common_denominator = common_denominator * denom // math.gcd(common_denominator, denom)
        
        h = int(fractions_list[0] * common_denominator) if fractions_list[0] is not None else 0
        k = int(fractions_list[1] * common_denominator) if fractions_list[1] is not None else 0
        l = int(fractions_list[2] * common_denominator) if fractions_list[2] is not None else 0
        
        return cls(h, k, l)
    
    def __str__(self):
        def format_index(idx):
            if idx < 0:
                return f"\\{abs(idx)}"
            return str(idx)
        return f"({format_index(self.h)}{format_index(self.k)}{format_index(self.l)})"
    
    def plot_3d(self, size=2, show_axes=True):
        """Красивая 3D визуализация плоскости"""
        fig = plt.figure(figsize=(10, 8))
        ax = fig.add_subplot(111, projection='3d')
        
        # Создаем сетку для плоскости
        x = np.linspace(-size, size, 20)
        y = np.linspace(-size, size, 20)
        X, Y = np.meshgrid(x, y)
        
        # Вычисляем Z из уравнения плоскости hX + kY + lZ = 0
        if self.l != 0:
            Z = (-self.h * X - self.k * Y) / self.l
            ax.plot_surface(X, Y, Z, alpha=0.7, color='lightblue')
        elif self.k != 0:
            # Плоскость параллельна Z
            Y, Z = np.meshgrid(x, x)
            X = np.zeros_like(Y)
            ax.plot_surface(X, Y, Z, alpha=0.7, color='lightblue')
        else:
            # Плоскость параллельна Y и Z
            Y, Z = np.meshgrid(x, x)
            X = np.zeros_like(Y)
            ax.plot_surface(X, Y, Z, alpha=0.7, color='lightblue')
        
        if show_axes:
            # Оси координат
            ax.quiver(0, 0, 0, size, 0, 0, color='r', arrow_length_ratio=0.1, linewidth=2)
            ax.quiver(0, 0, 0, 0, size, 0, color='g', arrow_length_ratio=0.1, linewidth=2)
            ax.quiver(0, 0, 0, 0, 0, size, color='b', arrow_length_ratio=0.1, linewidth=2)
            ax.text(size, 0, 0, 'X', color='r', fontsize=12)
            ax.text(0, size, 0, 'Y', color='g', fontsize=12)
            ax.text(0, 0, size, 'Z', color='b', fontsize=12)
            
            # Кристаллическая решетка (точки)
            points = []
            for i in range(-1, 2):
                for j in range(-1, 2):
                    for k in range(-1, 2):
                        points.append([i, j, k])
            points = np.array(points)
            ax.scatter(points[:, 0], points[:, 1], points[:, 2], c='red', s=50, alpha=0.6)
        
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        ax.set_title(f'Плоскость Миллера {self}')
        ax.set_xlim([-size, size])
        ax.set_ylim([-size, size])
        ax.set_zlim([-size, size])
        
        plt.tight_layout()
        plt.show()

# Интерактивный режим с визуализацией
def interactive_visualizer():
    print("=== Интерактивная визуализация плоскостей Миллера ===")
    
    while True:
        print("\nВведите отрезки на осях (или 'q' для выхода):")
        try:
            a_input = input("Отрезок на X: ").strip()
            if a_input.lower() == 'q':
                break
                
            b_input = input("Отрезок на Y: ").strip()
            c_input = input("Отрезок на Z: ").strip()
            
            a = float(a_input) if a_input.lower() != 'inf' else float('inf')
            b = float(b_input) if b_input.lower() != 'inf' else float('inf')
            c = float(c_input) if c_input.lower() != 'inf' else float('inf')
            
            plane = MillerPlane.from_intercepts(a, b, c)
            print(f"Плоскость Миллера: {plane}")
            
            # Показываем визуализацию
            try:
                plane.plot_3d(size=2)
            except ImportError:
                print("Для 3D визуализации установите matplotlib и numpy")
                print("Выполните: pip install matplotlib numpy")
                
        except ValueError:
            print("Ошибка ввода. Используйте числа или 'inf'")
        except Exception as e:
            print(f"Ошибка: {e}")

if __name__ == "__main__":
    # Демонстрация нескольких плоскостей
    demo_planes = [
        (1, 0, 0),
        (1, 1, 0), 
        (1, 1, 1),
        (0, 1, 1),
    ]
    
    print("Демонстрация плоскостей Миллера:")
    for h, k, l in demo_planes:
        plane = MillerPlane(h, k, l)
        print(f"Плоскость {plane}")
        
        # Показываем 3D визуализацию если установлены библиотеки
        try:
            plane.plot_3d()
        except ImportError:
            print("3D визуализация недоступна - установите matplotlib и numpy")
            break
    
    # Запускаем интерактивный режим
    interactive_visualizer()