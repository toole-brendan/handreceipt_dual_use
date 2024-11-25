use sha2::{Sha256, Digest};

pub struct MerkleTree {
    nodes: Vec<Vec<u8>>,
}

impl MerkleTree {
    pub fn new() -> Self {
        Self { nodes: Vec::new() }
    }

    pub fn insert(&mut self, data: Vec<u8>) {
        self.nodes.push(data);
    }

    pub fn root_hash(&self) -> Vec<u8> {
        if self.nodes.is_empty() {
            return vec![];
        }

        let mut current_level = self.nodes.clone();

        while current_level.len() > 1 {
            let mut next_level = Vec::new();

            for chunk in current_level.chunks(2) {
                let mut hasher = Sha256::new();
                hasher.update(&chunk[0]);
                
                if chunk.len() > 1 {
                    hasher.update(&chunk[1]);
                }

                next_level.push(hasher.finalize().to_vec());
            }

            current_level = next_level;
        }

        current_level[0].clone()
    }

    pub fn verify(&self, data: Vec<u8>) -> bool {
        self.nodes.contains(&data)
    }

    pub fn len(&self) -> usize {
        self.nodes.len()
    }

    pub fn is_empty(&self) -> bool {
        self.nodes.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_tree() {
        let tree = MerkleTree::new();
        assert!(tree.is_empty());
        assert_eq!(tree.root_hash(), Vec::<u8>::new());
    }

    #[test]
    fn test_single_node() {
        let mut tree = MerkleTree::new();
        let data = b"test data".to_vec();
        tree.insert(data.clone());
        assert!(tree.verify(data));
    }

    #[test]
    fn test_multiple_nodes() {
        let mut tree = MerkleTree::new();
        let data1 = b"data1".to_vec();
        let data2 = b"data2".to_vec();
        tree.insert(data1.clone());
        tree.insert(data2.clone());
        assert!(tree.verify(data1));
        assert!(tree.verify(data2));
    }
} 