use sha2::{Sha512, Digest};

pub struct MerkleTree {
    nodes: Vec<Vec<String>>,
}

impl MerkleTree {
    pub fn new(leaves: Vec<Vec<u8>>) -> Self {
        let mut tree = MerkleTree { nodes: Vec::new() };
        if leaves.is_empty() {
            return tree;
        }

        // Convert leaves to hex strings
        let mut current_level: Vec<String> = leaves
            .iter()
            .map(|data| {
                let mut hasher = Sha512::new();
                hasher.update(data);
                hex::encode(&hasher.finalize()[..])
            })
            .collect();

        tree.nodes.push(current_level.clone());

        // Build tree levels
        while current_level.len() > 1 {
            let mut next_level = Vec::new();
            for chunk in current_level.chunks(2) {
                let mut hasher = Sha512::new();
                hasher.update(chunk[0].as_bytes());
                if chunk.len() > 1 {
                    hasher.update(chunk[1].as_bytes());
                } else {
                    hasher.update(chunk[0].as_bytes()); // Duplicate last node if odd
                }
                next_level.push(hex::encode(&hasher.finalize()[..]));
            }
            tree.nodes.push(next_level.clone());
            current_level = next_level;
        }

        tree
    }

    pub fn root_hash(&self) -> Option<&str> {
        self.nodes
            .last()
            .and_then(|level| level.first())
            .map(|hash| hash.as_str())
    }

    pub fn verify(&self, data: &[u8], proof: &[String]) -> bool {
        let mut hasher = Sha512::new();
        hasher.update(data);
        let mut current_hash = hex::encode(&hasher.finalize()[..]);

        for sibling in proof {
            let mut hasher = Sha512::new();
            if current_hash < *sibling {
                hasher.update(current_hash.as_bytes());
                hasher.update(sibling.as_bytes());
            } else {
                hasher.update(sibling.as_bytes());
                hasher.update(current_hash.as_bytes());
            }
            current_hash = hex::encode(&hasher.finalize()[..]);
        }

        Some(current_hash.as_str()) == self.root_hash()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_merkle_tree() {
        let data = vec![
            vec![1, 2, 3],
            vec![4, 5, 6],
            vec![7, 8, 9],
            vec![10, 11, 12],
        ];

        let tree = MerkleTree::new(data.clone());
        assert!(tree.root_hash().is_some());

        // Verify first leaf
        let proof = vec![
            tree.nodes[0][1].clone(),
            tree.nodes[1][1].clone(),
        ];
        assert!(tree.verify(&data[0], &proof));

        // Verify with invalid data
        let invalid_data = vec![1, 2, 4];
        assert!(!tree.verify(&invalid_data, &proof));
    }
} 