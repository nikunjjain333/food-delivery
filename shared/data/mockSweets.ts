import { Sweet } from '../store/useCartStore';

export const mockSweets: Sweet[] = [
  {
    id: '1',
    name: 'Kaju Katli',
    price: 800,
    description: 'Premium diamond-shaped sweet made with rich cashew nuts and edible silver foil.',
    imageUrl: 'https://images.unsplash.com/photo-1605197136378-011285226ec4?q=80&w=600&auto=format&fit=crop', // generic placeholder
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Motichoor Ladoo',
    price: 450,
    description: 'Classic tiny gram flour pearls fried in ghee and soaked in sugar syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1599813959800-41006900f913?q=80&w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Rasgulla',
    price: 300,
    description: 'Spongy and syrupy dessert made from ball-shaped dumplings of chhena.',
    imageUrl: 'https://images.unsplash.com/photo-1558230588-ceb8a3e74bd6?q=80&w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Gulab Jamun',
    price: 350,
    description: 'Deep-fried milk-solid-based sweet soaked in a golden syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?q=80&w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Mysore Pak',
    price: 600,
    description: 'Rich sweet dish prepared in ghee with gram flour and sugar.',
    imageUrl: 'https://images.unsplash.com/photo-1589114407384-be23debbb5f2?q=80&w=600&auto=format&fit=crop',
    isAvailable: true,
  },
];
